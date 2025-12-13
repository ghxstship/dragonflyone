#!/bin/bash

# Continuous Audit and Remediation Script
# Runs every 5 minutes to monitor and report on build/lint status
# Usage: ./scripts/continuous-audit.sh

set -e

PROJECT_ROOT="/Users/julianclarkson/Documents/Dragonflyone"
LOG_DIR="$PROJECT_ROOT/audit-logs"
INTERVAL_SECONDS=300  # 5 minutes

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_audit() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local log_file="$LOG_DIR/audit_$timestamp.log"
    
    log "Starting audit cycle..."
    echo "=== Audit Report - $(date) ===" > "$log_file"
    
    # Track overall status
    local has_errors=false
    local has_warnings=false
    
    # Don't exit on errors during audit
    set +e
    
    # 1. Run lint check for all apps
    log "Running lint checks..."
    echo -e "\n--- LINT CHECK ---" >> "$log_file"
    
    cd "$PROJECT_ROOT"
    if pnpm turbo lint --filter=atlvs --filter=compvss --filter=gvteway 2>&1 | tee -a "$log_file" | grep -q "error"; then
        has_errors=true
        error "Lint errors found"
    elif grep -q "Warning" "$log_file"; then
        has_warnings=true
        warning "Lint warnings found (see log for details)"
    else
        success "Lint check passed"
    fi
    
    # 2. Run TypeScript type check
    log "Running TypeScript checks..."
    echo -e "\n--- TYPESCRIPT CHECK ---" >> "$log_file"
    
    if pnpm turbo build --filter=@ghxstship/config --filter=@ghxstship/ui 2>&1 | tee -a "$log_file" | grep -q "error"; then
        has_errors=true
        error "TypeScript errors in shared packages"
    else
        success "Shared packages TypeScript check passed"
    fi
    
    # 3. Quick build verification (uses cache if available)
    log "Verifying builds..."
    echo -e "\n--- BUILD VERIFICATION ---" >> "$log_file"
    
    for app in atlvs compvss gvteway; do
        if pnpm turbo build --filter=$app 2>&1 | tee -a "$log_file" | grep -q "Failed"; then
            has_errors=true
            error "Build failed for $app"
        else
            success "Build passed for $app"
        fi
    done
    
    # 4. Summary
    echo -e "\n--- SUMMARY ---" >> "$log_file"
    
    # Re-enable exit on error
    set -e
    
    if [ "$has_errors" = true ]; then
        echo "STATUS: ERRORS FOUND - Remediation required" >> "$log_file"
        error "Audit completed with errors - check $log_file"
    elif [ "$has_warnings" = true ]; then
        echo "STATUS: WARNINGS FOUND - Review recommended" >> "$log_file"
        warning "Audit completed with warnings - check $log_file"
    else
        echo "STATUS: ALL CHECKS PASSED" >> "$log_file"
        success "Audit completed successfully"
    fi
    
    # Always return 0 to keep the loop running
    return 0
}

cleanup_old_logs() {
    # Keep only last 24 hours of logs (288 files at 5-min intervals)
    log "Cleaning up old audit logs..."
    find "$LOG_DIR" -name "audit_*.log" -mtime +1 -delete 2>/dev/null || true
}

main() {
    log "=== Continuous Audit Monitor Started ==="
    log "Interval: ${INTERVAL_SECONDS}s (5 minutes)"
    log "Log directory: $LOG_DIR"
    log "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        run_audit
        cleanup_old_logs
        
        log "Next audit in 5 minutes..."
        echo "----------------------------------------"
        sleep $INTERVAL_SECONDS
    done
}

# Run single audit if --once flag is passed
if [ "$1" = "--once" ]; then
    run_audit
    exit $?
fi

# Run continuous monitoring
main
