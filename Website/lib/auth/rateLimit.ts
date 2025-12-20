/**
 * Rate limiting and brute-force protection for login attempts
 * Tracks failed login attempts by IP address with progressive lockout durations
 */

type AttemptRecord = {
    attempts: number;
    lockoutUntil: Date | null;
    lastAttempt: Date;
    lockoutCount: number; // Track how many times they've been locked out
};

// In-memory store for tracking login attempts by IP address (could be replaced with a persistent store someday maybe?)
const attemptStore = new Map<string, AttemptRecord>();

// Configuration constants
const MAX_ATTEMPTS = 5;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

const LOCKOUT_DURATIONS = [
    15 * 60 * 1000,      // 1st lockout: 15 minutes
    30 * 60 * 1000,      // 2nd lockout: 30 minutes
    60 * 60 * 1000,      // 3rd lockout: 1 hour
    2 * 60 * 60 * 1000,  // 4th lockout: 2 hours
    4 * 60 * 60 * 1000,  // 5th lockout: 4 hours
    8 * 60 * 60 * 1000,  // 6th lockout: 8 hours
    24 * 60 * 60 * 1000, // 7th+ lockout: 24 hours
];
function getLockoutDuration(lockoutCount: number): number {
    const index = Math.min(lockoutCount, LOCKOUT_DURATIONS.length - 1);
    return LOCKOUT_DURATIONS[index];
}

/**
 * Clean up expired entries from the attempt store
 */
function cleanupExpiredEntries(): void {
    const now = new Date();
    const expirationThreshold = 24 * 60 * 60 * 1000; // Remove entries older than 24 hours with no lockout

    for (const [ip, record] of attemptStore.entries()) {
        // Remove if: no lockout and last attempt was more than 24 hours ago
        if (!record.lockoutUntil && now.getTime() - record.lastAttempt.getTime() > expirationThreshold) {
            attemptStore.delete(ip);
        }
        // Remove if: lockout expired more than 24 hours ago
        else if (record.lockoutUntil && now.getTime() - record.lockoutUntil.getTime() > expirationThreshold) {
            attemptStore.delete(ip);
        }
    }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}

/**
 * Get or create an attempt record for an IP address
 */
function getAttemptRecord(ip: string): AttemptRecord {
    let record = attemptStore.get(ip);

    if (!record) {
        record = {
            attempts: 0,
            lockoutUntil: null,
            lastAttempt: new Date(),
            lockoutCount: 0,
        };
        attemptStore.set(ip, record);
    }

    return record;
}

/**
 * Check if an IP address is currently locked out
 * Returns the lockout info if locked, null otherwise
 */
export function checkRateLimit(ip: string): {
    isLocked: boolean;
    remainingTime?: number;
    attemptsRemaining?: number;
    message?: string;
} {
    const record = getAttemptRecord(ip);
    const now = new Date();

    // Check if currently locked out
    if (record.lockoutUntil && now < record.lockoutUntil) {
        const remainingMs = record.lockoutUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

        return {
            isLocked: true,
            remainingTime: remainingMs,
            message: `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
        };
    }

    // Lockout expired, reset attempts
    if (record.lockoutUntil && now >= record.lockoutUntil) {
        record.attempts = 0;
        record.lockoutUntil = null;
    }

    // Return remaining attempts
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - record.attempts);

    return {
        isLocked: false,
        attemptsRemaining,
    };
}

/**
 * Record a failed login attempt for an IP address
 * Returns lockout info if the user is now locked out
 */
export function recordFailedAttempt(ip: string): {
    isLocked: boolean;
    remainingTime?: number;
    attemptsRemaining?: number;
    message?: string;
} {
    const record = getAttemptRecord(ip);
    const now = new Date();

    // Increment attempt counter
    record.attempts += 1;
    record.lastAttempt = now;

    // Check if we've hit the max attempts
    if (record.attempts >= MAX_ATTEMPTS) {
        record.lockoutCount += 1;
        const lockoutDuration = getLockoutDuration(record.lockoutCount - 1);
        record.lockoutUntil = new Date(now.getTime() + lockoutDuration);

        const remainingMinutes = Math.ceil(lockoutDuration / (60 * 1000));

        return {
            isLocked: true,
            remainingTime: lockoutDuration,
            message: `Too many failed attempts. Account locked for ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
        };
    }

    // Return remaining attempts
    const attemptsRemaining = MAX_ATTEMPTS - record.attempts;

    return {
        isLocked: false,
        attemptsRemaining,
        message: attemptsRemaining > 0
            ? `Invalid password. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`
            : undefined,
    };
}

export function recordSuccessfulAttempt(ip: string): void {
    const record = getAttemptRecord(ip);
    // reset on successful login
    record.attempts = 0;
    record.lockoutUntil = null;
    record.lastAttempt = new Date();
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations
 */
export function getClientIp(request: Request): string {
    const headers = request.headers;

    // Try common headers for proxied requests
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return 'unknown';
}

export function formatRemainingTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`;
    }

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
    }

    return `${Math.max(1, minutes)} minute${minutes !== 1 ? 's' : ''}`;
}

export function resetAttempts(ip: string): void {
    attemptStore.delete(ip);
}

export function getRateLimitStats() {
    return {
        totalTrackedIps: attemptStore.size,
        lockedIps: Array.from(attemptStore.entries())
            .filter(([, record]) => record.lockoutUntil && new Date() < record.lockoutUntil)
            .length,
    };
}
