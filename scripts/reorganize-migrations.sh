#!/bin/bash

# Script to reorganize and renumber Supabase migrations
# This eliminates duplicate numbers and creates a clean sequence

MIGRATIONS_DIR="/Users/julianclarkson/Documents/Dragonflyone/supabase/migrations"
TEMP_DIR="/Users/julianclarkson/Documents/Dragonflyone/supabase/migrations_temp"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Get all migration files sorted
cd "$MIGRATIONS_DIR"

# Counter for new migration numbers
counter=1

# Process each file in sorted order
for file in $(ls -1 *.sql | sort); do
    # Extract the description part (everything after the number and underscore)
    description=$(echo "$file" | sed 's/^[0-9]*_//')
    
    # Create new filename with padded number
    new_name=$(printf "%04d_%s" $counter "$description")
    
    # Copy to temp with new name
    cp "$file" "$TEMP_DIR/$new_name"
    
    echo "Renamed: $file -> $new_name"
    
    ((counter++))
done

echo ""
echo "Total migrations: $((counter-1))"
echo ""
echo "Files have been copied to $TEMP_DIR"
echo "Review and then run: rm supabase/migrations/*.sql && mv supabase/migrations_temp/*.sql supabase/migrations/"
