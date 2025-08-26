import { db } from '../db';
import { analyticsEvents, analyticsDaily, gamePlayDaily, games } from '@shared/schema';
import { sql, and, gte, lte, eq, desc, asc } from 'drizzle-orm';

export interface AnalyticsSummary {
  visits: number;
  uniques: number;
  gameStarts: number;
  avgPlayTime: number; // in seconds
  onlineNow: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TopGame {
  id: number;
  title: string;
  starts: number;
  avgDuration: number; // in seconds
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

export interface ReferrerStats {
  referrerHost: string;
  count: number;
}

export class AnalyticsService {
  
  // Get summary analytics for a date range
  async getSummary(fromDate: string, toDate: string): Promise<AnalyticsSummary> {
    try {
      // First try to get from aggregated daily data
      const dailyResult = await db
        .select({
          visits: sql<number>`COALESCE(SUM(${analyticsDaily.visits}), 0)`,
          uniques: sql<number>`COALESCE(SUM(${analyticsDaily.uniques}), 0)`,
          gameStarts: sql<number>`COALESCE(SUM(${analyticsDaily.gameStarts}), 0)`,
          avgPlayMs: sql<number>`COALESCE(AVG(${analyticsDaily.avgPlayMs}), 0)`
        })
        .from(analyticsDaily)
        .where(
          and(
            gte(analyticsDaily.day, fromDate),
            lte(analyticsDaily.day, toDate)
          )
        );

      let summary = dailyResult[0];

      // If no daily data found, fall back to raw events
      if (!summary || summary.visits === 0) {
        const rawResult = await db
          .select({
            visits: sql<number>`COALESCE(COUNT(*), 0)`,
            uniques: sql<number>`COALESCE(COUNT(DISTINCT ${analyticsEvents.visitorId}), 0)`,
            gameStarts: sql<number>`COALESCE(COUNT(CASE WHEN ${analyticsEvents.eventType} = 'play_start' THEN 1 END), 0)`,
            avgPlayMs: sql<number>`COALESCE(AVG(CASE WHEN ${analyticsEvents.eventType} = 'play_end' THEN ${analyticsEvents.durationMs} END), 0)`
          })
          .from(analyticsEvents)
          .where(
            and(
              gte(analyticsEvents.ts, sql`${fromDate}::date`),
              lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
              eq(analyticsEvents.eventType, 'page_view')
            )
          );

        const gameStartsResult = await db
          .select({
            gameStarts: sql<number>`COALESCE(COUNT(*), 0)`
          })
          .from(analyticsEvents)
          .where(
            and(
              gte(analyticsEvents.ts, sql`${fromDate}::date`),
              lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
              eq(analyticsEvents.eventType, 'play_start')
            )
          );

        summary = {
          visits: rawResult[0]?.visits || 0,
          uniques: rawResult[0]?.uniques || 0,
          gameStarts: gameStartsResult[0]?.gameStarts || 0,
          avgPlayMs: rawResult[0]?.avgPlayMs || 0
        };
      }

      // Get online now count (last 5 minutes)
      const onlineResult = await db
        .select({
          onlineNow: sql<number>`COALESCE(COUNT(DISTINCT ${analyticsEvents.visitorId}), 0)`
        })
        .from(analyticsEvents)
        .where(
          gte(analyticsEvents.ts, sql`NOW() - INTERVAL '5 minutes'`)
        );

      return {
        visits: summary.visits,
        uniques: summary.uniques,
        gameStarts: summary.gameStarts,
        avgPlayTime: Math.round((summary.avgPlayMs || 0) / 1000), // Convert to seconds
        onlineNow: onlineResult[0]?.onlineNow || 0
      };

    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        visits: 0,
        uniques: 0,
        gameStarts: 0,
        avgPlayTime: 0,
        onlineNow: 0
      };
    }
  }

  // Get time series data for visits or game starts
  async getTimeSeries(metric: 'visits' | 'starts', fromDate: string, toDate: string): Promise<TimeSeriesPoint[]> {
    try {
      if (metric === 'visits') {
        // Try daily aggregates first
        const dailyResult = await db
          .select({
            date: analyticsDaily.day,
            value: analyticsDaily.visits
          })
          .from(analyticsDaily)
          .where(
            and(
              gte(analyticsDaily.day, fromDate),
              lte(analyticsDaily.day, toDate)
            )
          )
          .orderBy(asc(analyticsDaily.day));

        if (dailyResult.length > 0) {
          return dailyResult.map(row => ({
            date: row.date!,
            value: Number(row.value)
          }));
        }

        // Fallback to raw events
        const rawResult = await db
          .select({
            date: sql<string>`DATE(${analyticsEvents.ts})`,
            value: sql<number>`COUNT(*)`
          })
          .from(analyticsEvents)
          .where(
            and(
              gte(analyticsEvents.ts, sql`${fromDate}::date`),
              lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
              eq(analyticsEvents.eventType, 'page_view')
            )
          )
          .groupBy(sql`DATE(${analyticsEvents.ts})`)
          .orderBy(asc(sql`DATE(${analyticsEvents.ts})`));

        return rawResult.map(row => ({
          date: row.date!,
          value: row.value
        }));
      } else {
        // Game starts
        const result = await db
          .select({
            date: sql<string>`DATE(${analyticsEvents.ts})`,
            value: sql<number>`COUNT(*)`
          })
          .from(analyticsEvents)
          .where(
            and(
              gte(analyticsEvents.ts, sql`${fromDate}::date`),
              lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
              eq(analyticsEvents.eventType, 'play_start')
            )
          )
          .groupBy(sql`DATE(${analyticsEvents.ts})`)
          .orderBy(asc(sql`DATE(${analyticsEvents.ts})`));

        return result.map(row => ({
          date: row.date!,
          value: row.value
        }));
      }
    } catch (error) {
      console.error('Error getting time series data:', error);
      return [];
    }
  }

  // Get top games by starts
  async getTopGames(fromDate: string, toDate: string, limit = 20): Promise<TopGame[]> {
    try {
      const result = await db
        .select({
          gameId: analyticsEvents.gameId,
          title: games.title,
          slug: games.slug,
          starts: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'play_start' THEN 1 END)`,
          avgDuration: sql<number>`COALESCE(AVG(CASE WHEN ${analyticsEvents.eventType} = 'play_end' THEN ${analyticsEvents.durationMs} END), 0)`
        })
        .from(analyticsEvents)
        .leftJoin(games, eq(analyticsEvents.gameId, games.id))
        .where(
          and(
            gte(analyticsEvents.ts, sql`${fromDate}::date`),
            lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
            sql`${analyticsEvents.gameId} IS NOT NULL`,
            sql`${games.id} IS NOT NULL`   // ensure matched game only
          )
        )
        .groupBy(analyticsEvents.gameId, games.title, games.slug)
        .orderBy(desc(sql`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'play_start' THEN 1 END)`))
        .limit(limit);

      return result.map(row => ({
        id: row.gameId!,
        title: row.title || row.slug || 'Unknown Game',
        starts: row.starts,
        avgDuration: Math.round((row.avgDuration || 0) / 1000) // Convert to seconds
      }));
    } catch (error) {
      console.error('Error getting top games:', error);
      return [];
    }
  }

  // Get device statistics
  async getDeviceStats(fromDate: string, toDate: string): Promise<DeviceStats[]> {
    try {
      const result = await db
        .select({
          device: analyticsEvents.device,
          count: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})`
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.ts, sql`${fromDate}::date`),
            lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
            eq(analyticsEvents.eventType, 'page_view')
          )
        )
        .groupBy(analyticsEvents.device)
        .orderBy(desc(sql`COUNT(DISTINCT ${analyticsEvents.visitorId})`));

      const total = result.reduce((sum, row) => sum + row.count, 0);

      return result.map(row => ({
        device: row.device!,
        count: row.count,
        percentage: total > 0 ? Number(((row.count / total) * 100).toFixed(1)) : 0
      }));
    } catch (error) {
      console.error('Error getting device stats:', error);
      return [];
    }
  }

  // Get referrer statistics
  async getReferrerStats(fromDate: string, toDate: string, limit = 20): Promise<ReferrerStats[]> {
    try {
      const result = await db
        .select({
          referrerHost: analyticsEvents.referrerHost,
          count: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})`
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.ts, sql`${fromDate}::date`),
            lte(analyticsEvents.ts, sql`(${toDate}::date + interval '1 day')`),
            eq(analyticsEvents.eventType, 'page_view'),
            sql`${analyticsEvents.referrerHost} IS NOT NULL`
          )
        )
        .groupBy(analyticsEvents.referrerHost)
        .orderBy(desc(sql`COUNT(DISTINCT ${analyticsEvents.visitorId})`))
        .limit(limit);

      return result.map(row => ({
        referrerHost: row.referrerHost!,
        count: row.count
      }));
    } catch (error) {
      console.error('Error getting referrer stats:', error);
      return [];
    }
  }

  // Aggregate daily data (used by cron job)
  async aggregateDaily(targetDate: string): Promise<void> {
    try {
      console.log(`Aggregating analytics data for ${targetDate}`);

      // Calculate site metrics for the day
      const siteMetrics = await db
        .select({
          visits: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'page_view' THEN 1 END)`,
          uniques: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})`,
          gameStarts: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'play_start' THEN 1 END)`,
          avgPlayMs: sql<number>`COALESCE(ROUND(AVG(CASE WHEN ${analyticsEvents.eventType} = 'play_end' THEN ${analyticsEvents.durationMs} END))::bigint, 0)`,
          mobileCount: sql<number>`COUNT(DISTINCT CASE WHEN ${analyticsEvents.device} = 'mobile' THEN ${analyticsEvents.visitorId} END)`,
          desktopCount: sql<number>`COUNT(DISTINCT CASE WHEN ${analyticsEvents.device} = 'desktop' THEN ${analyticsEvents.visitorId} END)`
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.ts, sql`${targetDate}::date`),
            sql`${analyticsEvents.ts} < (${targetDate}::date + interval '1 day')`
          )
        );

      if (siteMetrics.length > 0 && siteMetrics[0].visits > 0) {
        const metrics = siteMetrics[0];
        const totalDeviceUsers = metrics.mobileCount + metrics.desktopCount;
        const mobilePct = totalDeviceUsers > 0 ? (metrics.mobileCount / totalDeviceUsers) * 100 : 0;
        const desktopPct = totalDeviceUsers > 0 ? (metrics.desktopCount / totalDeviceUsers) * 100 : 0;

        // Insert or update daily summary
        await db
          .insert(analyticsDaily)
          .values({
            day: targetDate,
            visits: metrics.visits,
            uniques: metrics.uniques,
            gameStarts: metrics.gameStarts,
            // avgPlayMs already cast to bigint in SQL query  
            avgPlayMs: metrics.avgPlayMs,
            mobilePct: mobilePct.toString(),
            desktopPct: desktopPct.toString()
          })
          .onConflictDoUpdate({
            target: analyticsDaily.day,
            set: {
              visits: sql`EXCLUDED.visits`,
              uniques: sql`EXCLUDED.uniques`,
              gameStarts: sql`EXCLUDED.game_starts`,
              avgPlayMs: sql`EXCLUDED.avg_play_ms`,
              mobilePct: sql`EXCLUDED.mobile_pct`,
              desktopPct: sql`EXCLUDED.desktop_pct`
            }
          });

        console.log(`Daily summary aggregated: ${metrics.visits} visits, ${metrics.uniques} uniques`);
      }

      // Aggregate per-game data
      const gameMetrics = await db
        .select({
          gameId: analyticsEvents.gameId,
          starts: sql<number>`COUNT(CASE WHEN ${analyticsEvents.eventType} = 'play_start' THEN 1 END)`,
          avgDurationMs: sql<number>`COALESCE(ROUND(AVG(CASE WHEN ${analyticsEvents.eventType} = 'play_end' THEN ${analyticsEvents.durationMs} END))::bigint, 0)`
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.ts, sql`${targetDate}::date`),
            sql`${analyticsEvents.ts} < (${targetDate}::date + interval '1 day')`,
            sql`${analyticsEvents.gameId} IS NOT NULL`
          )
        )
        .groupBy(analyticsEvents.gameId);

      if (gameMetrics.length > 0) {
        for (const gameMetric of gameMetrics) {
          await db
            .insert(gamePlayDaily)
            .values({
              day: targetDate,
              gameId: gameMetric.gameId!,
              starts: gameMetric.starts,
              // avgDurationMs already cast to bigint in SQL query
              avgDurationMs: gameMetric.avgDurationMs
            })
            .onConflictDoUpdate({
              target: [gamePlayDaily.day, gamePlayDaily.gameId],
              set: {
                starts: sql`EXCLUDED.starts`,
                avgDurationMs: sql`EXCLUDED.avg_duration_ms`
              }
            });
        }
        console.log(`Game metrics aggregated for ${gameMetrics.length} games`);
      }

    } catch (error) {
      console.error('Error aggregating daily analytics:', error);
      throw error;
    }
  }

  // Clean old events (used by cron job)
  async cleanOldEvents(daysToKeep = 60): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await db
        .delete(analyticsEvents)
        .where(
          sql`${analyticsEvents.ts} < ${cutoffDate.toISOString()}`
        );

      console.log(`Cleaned old analytics events older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning old events:', error);
      throw error;
    }
  }

  // Development only: seed fake data for testing
  async debugSeed(options: { hours?: number, pages?: string[], games?: string[] } = {}): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Debug seed not available in production');
    }

    const { hours = 24, pages = ['/', '/games', '/games/pac-man', '/games/tetris'], games = ['pac-man', 'tetris'] } = options;
    
    try {
      console.log(`Seeding analytics data for last ${hours} hours`);

      const events = [];
      
      // Generate multiple events for testing
      for (let i = 0; i < hours * 3; i++) {
        const visitorId = `dev-visitor-${Math.floor(Math.random() * 50) + 1}`;
        const sessionId = `dev-session-${Math.floor(Math.random() * 100) + 1}`;
        const device = Math.random() < 0.5 ? 'mobile' : 'desktop';
        const path = pages[Math.floor(Math.random() * pages.length)];
        const country = ['US', 'UK', 'IN', 'CA', 'AU'][Math.floor(Math.random() * 5)];
        const referrer = Math.random() < 0.3 ? ['google.com', 'facebook.com'][Math.floor(Math.random() * 2)] : null;
        
        // Page view event (using default timestamp)
        events.push({
          eventType: 'page_view' as const,
          visitorId,
          sessionId,
          path,
          device,
          referrerHost: referrer,
          country
        });
        
        // Add some game events
        if (path.includes('/games/') && Math.random() < 0.2) {
          const gameId = Math.floor(Math.random() * 10) + 1;
          const playDuration = Math.floor(Math.random() * 300000) + 30000;
          
          // Game start
          events.push({
            eventType: 'play_start' as const,
            visitorId,
            sessionId,
            path,
            gameId,
            device,
            referrerHost: referrer,
            country
          });
          
          // Game end
          events.push({
            eventType: 'play_end' as const,
            visitorId,
            sessionId,
            path,
            gameId,
            durationMs: playDuration,
            device,
            referrerHost: referrer,
            country
          });
        }
      }
      
      // Insert events in batches
      if (events.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < events.length; i += batchSize) {
          const batch = events.slice(i, i + batchSize);
          await db.insert(analyticsEvents).values(batch);
        }
      }
      
      console.log(`✅ Seeded ${events.length} analytics events`);
    } catch (error) {
      console.error('Error seeding analytics data:', error);
      throw error;
    }
  }

  // Development only: aggregate data for a specific day
  async debugAggregateDay(targetDate?: Date): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Debug aggregation not available in production');
    }

    const date = targetDate || new Date();
    const dateString = date.toISOString().split('T')[0];
    
    console.log(`Debug aggregating data for ${dateString}`);
    await this.aggregateDaily(dateString);
    console.log(`✅ Debug aggregation completed for ${dateString}`);
  }
}