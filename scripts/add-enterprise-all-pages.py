#!/usr/bin/env python3
"""
Script to add enterprise layout to ALL page types (not just ListPage).
Handles PageLayout, custom layouts, etc.
"""

import os
import re

def get_app_name(file_path):
    """Get the app name (ATLVS or COMPVSS) from the file path."""
    if '/atlvs/' in file_path:
        return 'ATLVS'
    elif '/compvss/' in file_path:
        return 'COMPVSS'
    return 'App'

def get_app_layout(file_path):
    """Get the app layout component name."""
    if '/atlvs/' in file_path:
        return 'AtlvsAppLayout'
    elif '/compvss/' in file_path:
        return 'CompvssAppLayout'
    return 'AppLayout'

def get_page_title(file_path):
    """Extract page title from path."""
    parts = file_path.split('/app/')
    if len(parts) < 2:
        return "Page"
    
    path_part = parts[1].replace('/page.tsx', '').replace('page.tsx', '')
    if not path_part:
        return "Home"
    
    # Get the last segment
    segments = [s for s in path_part.split('/') if s and not s.startswith('[')]
    if segments:
        return segments[-1].replace('-', ' ').title()
    return "Page"

def get_breadcrumbs(file_path):
    """Generate breadcrumb items from the file path."""
    app_name = get_app_name(file_path)
    parts = file_path.split('/app/')
    if len(parts) < 2:
        return f"[{{ label: '{app_name}', href: '/dashboard' }}]"
    
    path_part = parts[1].replace('/page.tsx', '').replace('page.tsx', '')
    if not path_part:
        return f"[{{ label: '{app_name}', href: '/dashboard' }}]"
    
    segments = [s for s in path_part.split('/') if s and not s.startswith('[')]
    
    breadcrumbs = [f"{{ label: '{app_name}', href: '/dashboard' }}"]
    for i, segment in enumerate(segments):
        label = segment.replace('-', ' ').title()
        if i < len(segments) - 1:
            href = '/' + '/'.join(segments[:i+1])
            breadcrumbs.append(f"{{ label: '{label}', href: '{href}' }}")
        else:
            breadcrumbs.append(f"{{ label: '{label}' }}")
    
    return '[' + ', '.join(breadcrumbs) + ']'

def add_enterprise_header_import(content):
    """Add EnterprisePageHeader and MainContent imports if not present."""
    if 'EnterprisePageHeader' in content:
        return content, False
    
    # Find the @ghxstship/ui import
    import_match = re.search(r'(import\s*\{[^}]+\}\s*from\s*["\']@ghxstship/ui["\'];?)', content, re.DOTALL)
    if import_match:
        old_import = import_match.group(1)
        # Add EnterprisePageHeader and MainContent to the import
        if 'EnterprisePageHeader' not in old_import:
            # Find the closing brace
            new_import = old_import.replace('}', ',\n  EnterprisePageHeader,\n  MainContent,\n}')
            content = content.replace(old_import, new_import)
            return content, True
    
    return content, False

def process_file(file_path):
    """Process a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has enterprise header
        if 'EnterprisePageHeader' in content:
            return False
        
        # Skip landing pages (root page.tsx)
        if file_path.endswith('/app/page.tsx'):
            return False
        
        # Skip auth pages
        if '/auth/' in file_path:
            return False
        
        # Skip if it's a dynamic route detail page (like [id]/page.tsx)
        if re.search(r'/\[[^\]]+\]/page\.tsx$', file_path):
            # These are detail pages, handle separately
            return False
        
        modified = False
        
        # Add imports
        content, import_modified = add_enterprise_header_import(content)
        if import_modified:
            modified = True
        
        # Find SectionHeader and replace with EnterprisePageHeader
        section_header_pattern = r'<SectionHeader\s+kicker="[^"]+"\s+title="([^"]+)"\s+description="([^"]+)"[^/]*/>'
        match = re.search(section_header_pattern, content, re.DOTALL)
        
        if match:
            title = match.group(1)
            subtitle = match.group(2)
            breadcrumbs = get_breadcrumbs(file_path)
            
            enterprise_header = f'''<EnterprisePageHeader
        title="{title}"
        subtitle="{subtitle}"
        breadcrumbs={{{breadcrumbs}}}
        views={{[
          {{ id: 'default', label: 'Default', icon: 'grid' }},
        ]}}
        activeView="default"
        showFavorite
        showSettings
      />'''
            
            content = content[:match.start()] + enterprise_header + content[match.end():]
            modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def find_page_files(directory):
    """Find all page.tsx files in the directory."""
    page_files = []
    for root, dirs, files in os.walk(directory):
        # Skip auth and api directories
        dirs[:] = [d for d in dirs if d not in ['auth', 'api', '.next', 'node_modules']]
        
        for file in files:
            if file == 'page.tsx':
                page_files.append(os.path.join(root, file))
    
    return page_files

def main():
    apps_dir = '/Users/julianclarkson/Documents/Dragonflyone/apps'
    
    total_modified = 0
    total_skipped = 0
    
    for app in ['atlvs', 'compvss']:
        app_dir = os.path.join(apps_dir, app, 'src', 'app')
        if not os.path.exists(app_dir):
            continue
        
        page_files = find_page_files(app_dir)
        
        for file_path in page_files:
            if process_file(file_path):
                print(f"✓ Modified: {file_path}")
                total_modified += 1
            else:
                total_skipped += 1
    
    print(f"\n{'='*60}")
    print(f"Total modified: {total_modified}")
    print(f"Total skipped: {total_skipped}")

if __name__ == '__main__':
    main()
