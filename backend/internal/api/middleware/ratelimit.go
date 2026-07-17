package middleware

import (
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rate     int
	window   time.Duration
}

type visitor struct {
	count    int
	lastSeen time.Time
}

func getRateLimit() int {
	v := os.Getenv("RATE_LIMIT")
	if r, err := strconv.Atoi(v); err == nil && r > 0 {
		return r
	}
	return 100
}

func getRateWindow() time.Duration {
	v := os.Getenv("RATE_WINDOW_SECONDS")
	if r, err := strconv.Atoi(v); err == nil && r > 0 {
		return time.Duration(r) * time.Second
	}
	return time.Minute
}

var defaultLimiter = &RateLimiter{
	visitors: make(map[string]*visitor),
	rate:     getRateLimit(),
	window:   getRateWindow(),
}

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		defaultLimiter.mu.Lock()
		v, exists := defaultLimiter.visitors[ip]

		if !exists {
			defaultLimiter.visitors[ip] = &visitor{count: 1, lastSeen: time.Now()}
			defaultLimiter.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		if time.Since(v.lastSeen) > defaultLimiter.window {
			v.count = 1
			v.lastSeen = time.Now()
			defaultLimiter.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		v.count++
		v.lastSeen = time.Now()

		if v.count > defaultLimiter.rate {
			defaultLimiter.mu.Unlock()
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		defaultLimiter.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}
