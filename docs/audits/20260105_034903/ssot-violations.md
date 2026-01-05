# SSOT Violation Analysis

## Potential Entity Prop Violations
Components receiving full entity objects instead of IDs:
```
apps/compvss/src/app/(authenticated)/build-strike/page.tsx:71:          task: t.task,
apps/atlvs/src/app/p/[productionId]/schedule/page.tsx:94:            {filteredTasks.map((task: Task) => {
packages/ui/src/organisms/GanttChart/GanttChart.tsx:168:    (task: GanttTask<T>) => {
packages/ui/src/organisms/AutomationBuilder/AutomationBuilder.tsx:60:  assign_task: <UserPlus className="size-4" />,
packages/ui/src/organisms/AutomationBuilder/AutomationBuilder.tsx:70:  assign_task: "Assign Task",
packages/ui/src/organisms/Views/GanttChart/GanttChart.tsx:186:      const task: GanttTask<T> = {
packages/ui/src/organisms/Views/GanttChart/GanttChart.tsx:310:  const calculateTaskPosition = useCallback((task: GanttTask<T>) => {
packages/ui/src/organisms/Views/GanttChart/GanttChart.tsx:493:  const renderTask = useCallback((task: GanttTask<T>, row: GanttRow) => {
apps/compvss/src/app/(authenticated)/search/page.tsx:76:    projects.forEach((project: { id: string; name: string; client?: string }) => {
apps/compvss/src/app/(authenticated)/timekeeping/page.tsx:80:          project: e.project?.name || 'Unassigned',
apps/atlvs/src/app/(authenticated)/advancing/page.tsx:121:            project: r.project?.name || '',
apps/atlvs/src/test/utils.tsx:77:  private project: TestProject = {
apps/atlvs/src/components/project-card.tsx:4:  project: {
packages/ui/src/molecules/ProjectCard/ProjectCard.tsx:134:        aria-label={isInteractive ? `View project: ${title}` : undefined}
packages/config/app-context.tsx:46:  project: Project | null;
packages/config/app-context.tsx:71:  setProject: (project: Project | null) => void;
apps/gvteway/src/app/e/[eventId]/chat/page.tsx:9:interface Message { id: string; user: string; text: string; time: string; }
apps/gvteway/src/app/e/[eventId]/chat/page.tsx:11:  { id: "1", user: "John", text: "Anyone else excited for this?", time: "2:30 PM" },
apps/gvteway/src/app/e/[eventId]/chat/page.tsx:12:  { id: "2", user: "Sarah", text: "Can't wait! See you there!", time: "2:35 PM" },
apps/gvteway/src/app/e/[eventId]/photos/page.tsx:8:interface Photo { id: string; user: string; likes: number; }
apps/gvteway/src/app/e/[eventId]/photos/page.tsx:10:  { id: "1", user: "John", likes: 42 },
apps/gvteway/src/app/e/[eventId]/photos/page.tsx:11:  { id: "2", user: "Sarah", likes: 28 },
apps/gvteway/src/app/e/[eventId]/photos/page.tsx:12:  { id: "3", user: "Mike", likes: 15 },
apps/atlvs/src/app/(authenticated)/settings/organization/page.tsx:197:              Current user: {user?.email || 'Unknown'}
apps/atlvs/src/app/(authenticated)/settings/billing/page.tsx:76:                <Body className="text-text-muted mb-4">This action requires ATLVS Admin or higher role. Current user: {user?.email || "Unknown"}</Body>
apps/atlvs/src/app/(authenticated)/admin/users/page.tsx:88:  const { user: currentUser, hasRole } = useAuthContext();
apps/atlvs/src/app/(authenticated)/admin/users/page.tsx:110:  const openEditModal = (user: PlatformUser) => {
apps/atlvs/src/app/(authenticated)/admin/users/page.tsx:173:        restrictedMessage={`You do not have permission to manage user roles. This page requires ATLVS Admin or Legend role. Current user: ${currentUser?.email || "Unknown"}`}
apps/atlvs/src/app/(authenticated)/admin/users/page.tsx:220:                  {users.map((user: PlatformUser) => (
apps/atlvs/src/app/(authenticated)/admin/batch-operations/page.tsx:88:        restrictedMessage={`You do not have permission to access batch operations. This page requires ATLVS Admin or Legend role. Current user: ${user?.email || "Unknown"}`}
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:88:  { id: '1', action: "New deal closed", detail: "Rolling Loud Miami - $1.8M contract signed", time: "2 hours ago", user: "Jessica Park" },
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:89:  { id: '2', action: "Budget approved", detail: "Ultra 2025 - Additional $250K allocated for production", time: "5 hours ago", user: "Michael Chen" },
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:90:  { id: '3', action: "Project milestone reached", detail: "Art Basel - Final settlement completed", time: "1 day ago", user: "Elena Rodriguez" },
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:91:  { id: '4', action: "Asset checkout", detail: "Meyer Sound LEO System - checked out for III Points", time: "1 day ago", user: "David Kim" },
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:92:  { id: '5', action: "Invoice sent", detail: "Wynwood Life Nov - $45,000 invoice dispatched", time: "2 days ago", user: "Finance Team" },
apps/atlvs/src/app/(authenticated)/dashboard/page.tsx:167:                Current user: {user?.email || 'Unknown'}
apps/atlvs/src/app/(authenticated)/analytics/page.tsx:113:              Current user: {user?.email || 'Unknown'}
packages/ui/src/molecules/PresenceAvatars/PresenceAvatars.tsx:68:  user: PresenceUser;
packages/ui/src/molecules/CollaborativeField/CollaborativeField.tsx:98:  const getUserInitials = (user: CollaborationUser) => {
packages/ui/src/molecules/CollaborativeField/CollaborativeField.tsx:108:  const getUserColor = (user: CollaborationUser) => {
packages/config/middleware/withRoleProtection.tsx:23:  customCheck?: (user: ProtectedUser) => boolean | Promise<boolean>;
packages/config/middleware/withRoleProtection.tsx:43:  user: ProtectedUser | null;
packages/config/middleware/withRoleProtection.tsx:112:  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
packages/config/middleware/withRoleProtection.tsx:116:      return { authorized: true, user: null };
packages/config/middleware/withRoleProtection.tsx:118:    return { authorized: false, user: null, error: 'Not authenticated' };
packages/config/middleware/withRoleProtection.tsx:129:    return { authorized: false, user: null, error: 'User profile not found' };
packages/config/middleware/withRoleProtection.tsx:147:    return { authorized: true, user: protectedUser };
packages/config/middleware/withRoleProtection.tsx:166:      return { authorized: false, user: protectedUser, error: 'Insufficient role permissions' };
packages/config/middleware/withRoleProtection.tsx:176:      return { authorized: false, user: protectedUser, error: 'Insufficient role level' };
packages/config/middleware/withRoleProtection.tsx:188:      return { authorized: false, user: protectedUser, error: 'No access to this platform' };
packages/config/middleware/withRoleProtection.tsx:196:      return { authorized: false, user: protectedUser, error: 'Custom authorization check failed' };
packages/config/middleware/withRoleProtection.tsx:200:  return { authorized: true, user: protectedUser };
packages/config/middleware/withRoleProtection.tsx:208:  WrappedComponent: React.ComponentType<P & { user: ProtectedUser }>,
packages/config/auth-context.tsx:24:  user: User | null;
packages/config/layouts/BaseAppLayout.tsx:145:  user: ReturnType<typeof useAuth>["user"];
```
