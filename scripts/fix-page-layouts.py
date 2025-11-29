#!/usr/bin/env python3
"""
Fix pages that still use PageLayout + CreatorNavigationAuthenticated
to use AtlvsAppLayout/CompvssAppLayout with MainContent.
"""

import os
import re

def get_app_layout_import(file_path):
    """Get the correct app layout import based on app."""
    if '/atlvs/' in file_path:
        # Calculate relative path to app-layout
        depth = file_path.count('/app/') + file_path.split('/app/')[-1].count('/')
        rel_path = '../' * (depth - 1) + '../components/app-layout'
        return f'import {{ AtlvsAppLayout }} from "{rel_path}";', 'AtlvsAppLayout'
    elif '/compvss/' in file_path:
        depth = file_path.count('/app/') + file_path.split('/app/')[-1].count('/')
        rel_path = '../' * (depth - 1) + '../components/app-layout'
        return f'import {{ CompvssAppLayout }} from "{rel_path}";', 'CompvssAppLayout'
    return None, None

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already using AppLayout
        if 'AtlvsAppLayout' in content or 'CompvssAppLayout' in content:
            return False
        
        # Skip if not using the old pattern
        if 'CreatorNavigationAuthenticated' not in content:
            return False
        
        if 'PageLayout' not in content:
            return False
        
        modified = False
        
        # Get the correct import
        import_line, layout_name = get_app_layout_import(file_path)
        if not import_line:
            return False
        
        # Remove CreatorNavigationAuthenticated import
        content = re.sub(
            r'import\s*\{\s*CreatorNavigationAuthenticated\s*\}\s*from\s*["\'][^"\']+["\'];\s*\n?',
            '',
            content
        )
        
        # Add MainContent to @ghxstship/ui imports if not present
        if 'MainContent' not in content:
            content = re.sub(
                r'(\}\s*from\s*["\']@ghxstship/ui["\'];)',
                r'MainContent,\n\1',
                content
            )
        
        # Add app layout import after the @ghxstship/ui import
        content = re.sub(
            r'(from\s*["\']@ghxstship/ui["\'];)',
            f'\\1\n{import_line}',
            content
        )
        
        # Replace PageLayout with AppLayout pattern
        # Pattern: <PageLayout background="..." header={<CreatorNavigationAuthenticated ... />}>
        content = re.sub(
            r'<PageLayout\s+background="[^"]*"\s+header=\{<CreatorNavigationAuthenticated[^/]*/>\}>',
            f'<{layout_name}>',
            content
        )
        
        # Also handle: <PageLayout background="black" header={<CreatorNavigationAuthenticated />}>
        content = re.sub(
            r'<PageLayout[^>]*header=\{<CreatorNavigationAuthenticated[^}]*\}[^>]*>',
            f'<{layout_name}>',
            content
        )
        
        # Replace closing </PageLayout> with </AppLayout>
        content = re.sub(
            r'</PageLayout>',
            f'</{layout_name}>',
            content
        )
        
        # Wrap content after EnterprisePageHeader with MainContent if not already
        # This is complex - skip for now, pages should work without it
        
        # Remove PageLayout from imports
        content = re.sub(r',?\s*PageLayout\s*,?', ',', content)
        content = re.sub(r',\s*,', ',', content)  # Clean up double commas
        content = re.sub(r'\{\s*,', '{', content)  # Clean up leading comma
        content = re.sub(r',\s*\}', '}', content)  # Clean up trailing comma
        
        # Remove SectionHeader if not used
        if 'SectionHeader' in content and '<SectionHeader' not in content:
            content = re.sub(r',?\s*SectionHeader\s*,?', ',', content)
            content = re.sub(r',\s*,', ',', content)
            content = re.sub(r'\{\s*,', '{', content)
            content = re.sub(r',\s*\}', '}', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error: {file_path}: {e}")
        return False

def find_files(directory):
    files = []
    for root, dirs, filenames in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ['auth', 'api', '.next', 'node_modules']]
        for f in filenames:
            if f == 'page.tsx':
                files.append(os.path.join(root, f))
    return files

def main():
    modified = 0
    for app in ['atlvs', 'compvss']:
        app_dir = f'/Users/julianclarkson/Documents/Dragonflyone/apps/{app}/src/app'
        for f in find_files(app_dir):
            if process_file(f):
                print(f"✓ {f}")
                modified += 1
    print(f"\nModified: {modified}")

if __name__ == '__main__':
    main()
