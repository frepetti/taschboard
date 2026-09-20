import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Loader2, UserPlus, X, Store, Key } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { authAPI, adminAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { ClientVenueManager } from './ClientVenueManager';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { LoadingSpinner } from './LoadingSpinner';

interface UserManagementProps {
  session: any;
  onUpdate: () => void;
}

export function UserManagement({ session, onUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [securityUser, setSecurityUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState({
    pending: true,
    approved: true,
    rejected: true,
  });
  const [roleFilter, setRoleFilter] = useState({
    admin: true,
    inspector: true,
    client: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading users from btl_usuarios...');
      console.log('📝 Current session:', session?.user?.id, session?.user?.email);

      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading users:', error);
        throw error;
      }

      console.log('👥 Users loaded:', data?.length || 0);
      console.log('📊 Raw users data:', data);

      // Format data to match expected structure
      const formattedUsers = (data || []).map((user: any) => ({
        id: user.id,
        auth_id: user.auth_user_id, // auth_user_id is the UUID from auth.users
        name: user.nombre,
        email: user.email,
        role: user.rol,
        company: user.empresa,
        estado_aprobacion: user.estado_aprobacion || 'approved', // Default to approved for legacy users
        created_at: user.created_at
      }));

      console.log('✅ Formatted users:', formattedUsers);
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const user = userToDelete;

    // 1. Validate session before attempting operation
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !currentSession) {
      console.log('❌ Session invalid before delete operation');
      toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      // Allow the AuthContext to handle the redirect naturally or force it
      window.dispatchEvent(new Event('auth:unauthorized'));
      return;
    }

    try {
      // Try to use Admin API to delete from Auth + DB
      // We need to use auth_id (the uuid from auth.users) not the profile id
      const targetId = user.auth_id || user.id;

      console.log('🗑️ Deleting user via API:', targetId);

      const result = await adminAPI.deleteUser(targetId, currentSession.access_token);

      if (!result.success) {
        throw new Error(result.error || 'Error deleting user');
      }

      await loadUsers();
      onUpdate();
      toast.success('Usuario eliminado exitosamente');
    } catch (error: any) {
      console.error('⚠️ API Deletion failed:', error);

      // If it's a 401, we must stop and let the auth handler work
      if (error.message?.includes('Unauthorized')) {
        return; // AuthContext/api.ts will handle the logout
      }

      console.error('❌ Deletion failed:', error);
      toast.error('Error al eliminar usuario (API): ' + error.message);

      /*
      // Fallback: Try direct DB delete if Admin API fails (e.g. 500, 404, or 403 deployment issue)
      // This is crucial for "phantom" users who might not exist in Auth anymore
      try {
        console.log('🔄 Fallback: Attempting direct DB delete for ID:', user.id);
        const { error: dbError } = await supabase
          .from('btl_usuarios')
          .delete()
          .eq('id', user.id);
          
        if (dbError) throw dbError;
        
        await loadUsers();
        onUpdate();
        toast.warning('Usuario eliminado de la base de datos (API administrativa no disponible)');
      } catch (fallbackError: any) {
        console.error('❌ Fallback deletion failed:', fallbackError);
        toast.error('No se pudo eliminar el usuario: ' + (fallbackError.message || error.message));
      }
      */
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by search query
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status - handle undefined/null status
    const userStatus = user.estado_aprobacion || 'approved';
    const matchesStatus = statusFilter[userStatus as keyof typeof statusFilter] !== false;

    // Filter by role
    const userRole = user.role || 'inspector'; // Default fallback
    const matchesRole = roleFilter[userRole as keyof typeof roleFilter] !== false;

    console.log('User filter:', {
      name: user.name,
      estado: userStatus,
      matchesSearch,
      matchesStatus,
      matchesRole,
      statusFilter
    });

    return matchesSearch && matchesStatus && matchesRole;
  });

  console.log('Total users:', users.length);
  console.log('Filtered users:', filteredUsers.length);
  console.log('Status filter:', statusFilter);
  console.log('Role filter:', roleFilter);

  const getRoleBadgeStyle = (role: string, isActive: boolean = true) => {
    if (!isActive) return 'bg-transparent text-content-muted border-border-subtle border hover:border-content-muted';

    switch (role) {
      case 'admin':
        return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30 border';
      case 'inspector':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20 border';
      case 'client':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 border';
      default:
        return 'bg-surface-card-subtle text-content-muted border-border-subtle border';
    }
  };

  const getRoleBadge = (role: string) => {
    return getRoleBadgeStyle(role, true);
  };

  const getStatusBadgeStyle = (status: string, isActive: boolean = true) => {
    if (!isActive) return 'bg-transparent text-content-muted border-border-subtle border hover:border-content-muted';

    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 border';
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20 border';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20 border';
      default:
        return 'bg-surface-card-subtle text-content-muted border-border-subtle border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    return getStatusBadgeStyle(status, true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Cargando usuarios..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl text-content-main font-semibold">Gestión de Usuarios</h2>
          <p className="text-content-muted text-sm">Total: {users.length} usuarios</p>
        </div>
        <button
          onClick={() => setShowNewUserModal(true)}
          className="flex items-center gap-2 bg-theme-primary hover:brightness-95 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-4 sm:space-y-0 sm:flex sm:items-start sm:gap-8 shadow-sm">

        {/* Status Filters */}
        <div className="flex flex-col gap-3">
          <span className="text-content-main text-sm font-medium">Filtrar por estado:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter({ ...statusFilter, approved: !statusFilter.approved })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getStatusBadgeStyle('approved', statusFilter.approved)}`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setStatusFilter({ ...statusFilter, pending: !statusFilter.pending })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getStatusBadgeStyle('pending', statusFilter.pending)}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter({ ...statusFilter, rejected: !statusFilter.rejected })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getStatusBadgeStyle('rejected', statusFilter.rejected)}`}
            >
              Rechazados
            </button>
          </div>
        </div>

        {/* Separator for desktop */}
        <div className="hidden sm:block w-px h-16 bg-border-subtle"></div>

        {/* Role Filters */}
        <div className="flex flex-col gap-3">
          <span className="text-content-main text-sm font-medium">Filtrar por rol:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRoleFilter({ ...roleFilter, admin: !roleFilter.admin })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getRoleBadgeStyle('admin', roleFilter.admin)}`}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter({ ...roleFilter, client: !roleFilter.client })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getRoleBadgeStyle('client', roleFilter.client)}`}
            >
              Cliente
            </button>
            <button
              onClick={() => setRoleFilter({ ...roleFilter, inspector: !roleFilter.inspector })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${getRoleBadgeStyle('inspector', roleFilter.inspector)}`}
            >
              Inspector
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-card-subtle">
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Usuario</th>
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Email</th>
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Rol</th>
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Estado</th>
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Empresa</th>
                <th className="text-left text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Creado</th>
                <th className="text-right text-xs uppercase tracking-wider text-content-muted font-semibold p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border-subtle hover:bg-surface-card-subtle/60 cursor-pointer transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="p-4">
                    <div className="text-content-main font-medium">{user.name}</div>
                  </td>
                  <td className="p-4 text-content-main">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'inspector' ? 'Inspector' : 'Cliente'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.estado_aprobacion)}`}>
                      {getStatusLabel(user.estado_aprobacion)}
                    </span>
                  </td>
                  <td className="p-4 text-content-muted">{user.company || '-'}</td>
                  <td className="p-4 text-content-muted text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecurityUser(user);
                          setShowSecurityModal(true);
                        }}
                        className="p-2 hover:bg-surface-card-subtle rounded-lg text-content-muted hover:text-amber-500 transition-colors"
                        title="Gestionar Contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                        className="p-2 hover:bg-surface-card-subtle rounded-lg text-content-muted hover:text-content-main transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-content-muted hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-content-muted">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* New User Modal */}
      {showNewUserModal && (
        <NewUserModal
          session={session}
          onClose={() => setShowNewUserModal(false)}
          onSuccess={() => {
            loadUsers();
            onUpdate();
            setShowNewUserModal(false);
          }}
        />
      )}

      {/* Client Venue Manager Modal - REMOVED since it's now inside EditUserModal */}

      {/* Security Management Modal */}
      {showSecurityModal && securityUser && (
        <SecurityModal
          user={securityUser}
          currentUser={session?.user}
          onClose={() => {
            setShowSecurityModal(false);
            setSecurityUser(null);
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.email}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Usuario"
        variant="danger"
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            loadUsers();
            onUpdate();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function SecurityModal({ user, currentUser, onClose }: { user: any, currentUser: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const isSelfUpdate = currentUser?.email === user.email;

  const handleSendResetEmail = async () => {
    setLoading(true);
    try {
      // Use signInWithOtp instead of resetPasswordForEmail to send a code
      // This avoids the "Magic Link" issue blocked by proxies
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) throw error;
      toast.success(`Código de acceso enviado a ${user.email}`);
      onClose();
    } catch (error: any) {
      console.error('Error sending reset code:', error);
      if (error.message?.includes('security purposes') || error.status === 429) {
        // Extract seconds if available
        const secondsMatch = error.message.match(/after (\d+) seconds/);
        const seconds = secondsMatch ? secondsMatch[1] : 'unos';
        toast.error(`Por seguridad, debes esperar ${seconds} segundos antes de solicitar otro código.`);
      } else {
        toast.error('Error al enviar código: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (isSelfUpdate) {
        // Permitir cambio directo si es el propio usuario
        const { error } = await supabase.auth.updateUser({
          password: manualPassword
        });

        if (error) throw error;
        toast.success('Tu contraseña ha sido actualizada correctamente');
        onClose();
      } else {
        // Use Admin API to update other user's password
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        // We need the auth_id (user.id or user.auth_id)
        const targetId = user.auth_id || user.id;

        const result = await adminAPI.updateUser(
          targetId,
          { password: manualPassword },
          session.access_token
        );

        if (!result.success) {
          throw new Error(result.error || 'Error al actualizar contraseña');
        }

        toast.success(`Contraseña actualizada para ${user.email}`);
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-subtle shadow-2xl rounded-xl w-full max-w-md overflow-hidden text-content-main">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Key className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg text-content-main font-bold">Seguridad de Usuario</h3>
              <p className="text-content-muted text-xs truncate max-w-[200px]">{user.email}</p>
              {isSelfUpdate && <span className="text-[10px] bg-theme-primary/10 text-theme-primary px-1.5 py-0.5 rounded border border-theme-primary/20">Usuario Actual</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-content-muted hover:text-content-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Option 1: Email Reset (Recommended) */}
          <div className="bg-surface-card-subtle rounded-lg p-4 border border-border-subtle transition-colors">
            <h4 className="text-content-main font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Enviar Código de Acceso (OTP)
            </h4>
            <p className="text-sm text-content-muted mb-4">
              El usuario recibirá un código numérico para acceder. Debe usarlo en la opción "Olvidé mi contraseña" de la pantalla de login.
            </p>
            <button
              onClick={handleSendResetEmail}
              disabled={loading}
              className="w-full py-2.5 bg-theme-primary hover:brightness-95 disabled:bg-surface-card-subtle disabled:text-content-muted text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Código OTP'}
            </button>
          </div>

          <div className="relative flex items-center gap-2 py-2">
            <div className="h-px bg-border-subtle flex-1"></div>
            <span className="text-xs text-content-muted font-medium uppercase">Opciones Avanzadas</span>
            <div className="h-px bg-border-subtle flex-1"></div>
          </div>

          {/* Option 2: Manual Update (Admin Override) */}
          <div className={`transition-all duration-300 ${showManualInput ? 'opacity-100' : 'opacity-80'}`}>
            {!showManualInput ? (
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-2 border border-border-subtle text-content-muted hover:text-content-main hover:bg-surface-card-subtle rounded-lg text-sm transition-colors"
              >
                Establecer contraseña manualmente
              </button>
            ) : (
              <form onSubmit={handleManualUpdate} className="space-y-3 bg-surface-card-subtle p-4 rounded-lg border border-border-subtle">
                <div>
                  <label className="block text-sm text-content-main mb-1.5">Nueva Contraseña</label>
                  <input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-surface-card border border-border-subtle text-content-main px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-theme-primary/50 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 py-2 bg-surface-card border border-border-subtle hover:bg-surface-card-subtle text-content-muted hover:text-content-main rounded text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || manualPassword.length < 6}
                    className="flex-1 py-2 bg-amber-600 hover:brightness-95 text-white rounded text-sm transition-all font-medium"
                  >
                    {loading ? 'Procesando...' : 'Cambiar'}
                  </button>
                </div>
                {!isSelfUpdate && (
                  <p className="text-[10px] text-red-500 flex items-start gap-1 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                    <Store className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Nota: Solo el propio usuario puede cambiar su contraseña directamente desde aquí. Para otros usuarios, usa el correo de recuperación.</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
  const { themes } = useTheme();
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState(user.role || 'inspector');
  const [company, setCompany] = useState(user.company || '');
  const [status, setStatus] = useState(user.estado_aprobacion || 'approved');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'venues'>('profile');

  const availableThemes = themes.filter(t => t.activo);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('btl_usuarios')
        .update({
          nombre: name,
          rol: role,
          empresa: company ? company.trim() : null,
          estado_aprobacion: status
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Usuario actualizado correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-subtle shadow-2xl rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-content-main">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-card">
          <div>
            <h3 className="text-xl text-content-main font-bold">Editar Usuario</h3>
            <p className="text-content-muted text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-content-muted hover:text-content-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (only for clients) */}
        {role === 'client' && (
          <div className="flex border-b border-border-subtle px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                ? 'border-theme-primary text-theme-primary font-semibold'
                : 'border-transparent text-content-muted hover:text-content-main'
                }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'venues'
                ? 'border-amber-500 text-amber-500 font-semibold'
                : 'border-transparent text-content-muted hover:text-content-main'
                }`}
            >
              Asignar Venues
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' ? (
            <form id="edit-user-form" onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-content-muted mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content-muted mb-2">Email (Solo lectura)</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full bg-surface-card-subtle/50 border border-border-subtle text-content-muted px-4 py-2.5 rounded-lg cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content-muted mb-2">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all"
                  >
                    <option value="inspector">Inspector</option>
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-content-muted mb-2">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-content-muted mb-2">Empresa / Marca Tenant</label>
                  <input
                    type="text"
                    list="edit-user-companies"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej: Heineken"
                    className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all"
                  />
                  <datalist id="edit-user-companies">
                    {availableThemes.map(t => (
                      <option key={t.id || t.slug} value={t.nombre} />
                    ))}
                  </datalist>

                  {/* Quick selection chips */}
                  {availableThemes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-xs text-content-muted mr-1">Temas activos:</span>
                      {availableThemes.map(t => {
                        const isSelected = company.trim().toLowerCase() === t.nombre.toLowerCase() || company.trim().toLowerCase() === t.slug.toLowerCase();
                        return (
                          <button
                            key={t.id || t.slug}
                            type="button"
                            onClick={() => setCompany(t.nombre)}
                            className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-theme-primary/20 border-theme-primary text-content-main font-semibold'
                                : 'bg-surface-card border-border-subtle text-content-muted hover:text-content-main hover:border-theme-primary/40'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: t.primary_color }}
                            />
                            <span>{t.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full min-h-[400px]">
              <ClientVenueManager
                clientId={user.id}
                clientName={user.name}
                embedded={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-card flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-card-subtle border border-border-subtle hover:bg-surface-card text-content-muted hover:text-content-main rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          {activeTab === 'profile' && (
            <button
              type="submit"
              form="edit-user-form"
              disabled={loading}
              className="px-6 py-2 bg-theme-primary hover:brightness-95 disabled:bg-surface-card-subtle disabled:text-content-muted text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Cambios
            </button>
          )}
          {activeTab === 'venues' && (
            <button
              onClick={() => setActiveTab('profile')}
              className="px-6 py-2 bg-theme-primary hover:brightness-95 text-white rounded-lg transition-all font-medium shadow-sm"
            >
              Volver al Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewUserModal({ session: _session, onClose, onSuccess }: any) {
  const { themes } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('inspector');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const availableThemes = themes.filter(t => t.activo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.signup(email, password, name, role, company ? company.trim() : undefined);
      toast.success('Usuario creado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-2xl max-w-md w-full text-content-main">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-xl text-content-main font-semibold">Nuevo Usuario</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-content-muted font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm text-content-muted font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm text-content-muted font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm text-content-muted font-medium mb-2">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            >
              <option value="inspector">Inspector</option>
              <option value="client">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-content-muted font-medium mb-2">Empresa / Marca Tenant</label>
            <input
              type="text"
              list="new-user-companies"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej: Heineken"
              className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            />
            <datalist id="new-user-companies">
              {availableThemes.map(t => (
                <option key={t.id || t.slug} value={t.nombre} />
              ))}
            </datalist>

            {/* Quick selection chips */}
            {availableThemes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-xs text-content-muted mr-1">Temas activos:</span>
                {availableThemes.map(t => {
                  const isSelected = company.trim().toLowerCase() === t.nombre.toLowerCase() || company.trim().toLowerCase() === t.slug.toLowerCase();
                  return (
                    <button
                      key={t.id || t.slug}
                      type="button"
                      onClick={() => setCompany(t.nombre)}
                      className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-theme-primary/20 border-theme-primary text-content-main font-semibold'
                          : 'bg-surface-card border-border-subtle text-content-muted hover:text-content-main hover:border-theme-primary/40'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.primary_color }}
                      />
                      <span>{t.nombre}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-card-subtle border border-border-subtle hover:bg-surface-card text-content-muted hover:text-content-main px-4 py-2.5 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-theme-primary hover:brightness-95 disabled:bg-surface-card-subtle disabled:text-content-muted text-white px-4 py-2.5 rounded-lg transition-all shadow-sm font-medium"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}