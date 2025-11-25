/**
 * Pagination cursor utilities for webhook and API integrations
 * Supports cursor-based pagination for large data syncs
 */

export interface CursorOptions {
  /** Maximum items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Filter conditions */
  filters?: Record<string, unknown>;
}

export interface CursorData {
  /** Last item ID or timestamp */
  lastId?: string;
  lastValue?: string | number;
  /** Page number (for offset-based fallback) */
  page?: number;
  /** Sort configuration */
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  /** Creation timestamp */
  createdAt: number;
  /** Expiration timestamp */
  expiresAt: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
    limit: number;
  };
}

const CURSOR_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Pagination cursor encoder/decoder
 */
export class PaginationCursor {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.CURSOR_SECRET || 'default-cursor-secret';
  }

  /**
   * Encode cursor data to a string
   */
  encode(data: Omit<CursorData, 'createdAt' | 'expiresAt'>): string {
    const cursorData: CursorData = {
      ...data,
      createdAt: Date.now(),
      expiresAt: Date.now() + CURSOR_TTL_MS
    };

    const json = JSON.stringify(cursorData);
    const encoded = Buffer.from(json).toString('base64url');
    return encoded;
  }

  /**
   * Decode cursor string to data
   */
  decode(cursor: string): CursorData | null {
    try {
      const json = Buffer.from(cursor, 'base64url').toString('utf-8');
      const data = JSON.parse(json) as CursorData;

      // Check expiration
      if (data.expiresAt && data.expiresAt < Date.now()) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Create cursor from last item in result set
   */
  createFromLastItem<T extends Record<string, unknown>>(
    items: T[],
    sortBy: string = 'id',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): string | undefined {
    if (items.length === 0) return undefined;

    const lastItem = items[items.length - 1];
    const lastValue = lastItem[sortBy];

    return this.encode({
      lastId: lastItem.id as string,
      lastValue: lastValue as string | number,
      sortBy,
      sortOrder
    });
  }

  /**
   * Build SQL WHERE clause from cursor
   */
  buildWhereClause(cursor: CursorData): { clause: string; params: unknown[] } {
    const { lastValue, sortBy, sortOrder } = cursor;
    const operator = sortOrder === 'desc' ? '<' : '>';

    return {
      clause: `${sortBy} ${operator} $1`,
      params: [lastValue]
    };
  }

  /**
   * Build Supabase query modifier from cursor
   */
  buildSupabaseQuery(cursor: CursorData) {
    const { lastValue, sortBy, sortOrder } = cursor;
    const operator = sortOrder === 'desc' ? 'lt' : 'gt';

    return {
      column: sortBy,
      operator,
      value: lastValue
    };
  }
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  options: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
    limit: number;
  }
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      cursor: options.cursor,
      hasMore: options.hasMore,
      total: options.total,
      limit: options.limit
    }
  };
}

/**
 * Iterator-friendly endpoint helper for bulk data sync
 * Supports up to 10k records with automatic pagination
 */
export async function* iterateAllPages<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedResponse<T>>,
  maxRecords: number = 10000
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | undefined;
  let totalFetched = 0;

  do {
    const response = await fetchPage(cursor);
    yield response.data;

    totalFetched += response.data.length;
    cursor = response.pagination.cursor;

    if (totalFetched >= maxRecords) {
      break;
    }
  } while (cursor);
}
