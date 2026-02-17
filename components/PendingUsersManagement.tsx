import { useState, useEffect } from 'react';
import { Search, Check, X, Loader2, AlertCircle, UserCheck, Clock, Mail, Briefcase } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface PendingUsersManagementProps {
  session: any;
  onUpdate: () => void;
}

interface PendingUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  empresa: string | null;
  created_at: string;
  estado_aprobacion: string;
}

export function PendingUsersManagement({ session, onUpdate }: PendingUsersManagementProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [userToApprove, setUserToApprove] = useState<PendingUser | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('*')
        .eq('estado_aprobacion', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast.error('Error al cargar solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = (user: PendingUser) => {
    setUserToApprove(user);
  };

  const confirmApproveUser = async () => {
    if (!userToApprove) return;
    const user = userToApprove;

    setProcessingUserId(user.id);
    try {
      // Primero obtener el ID del admin actual desde btl_usuarios
      const { data: adminData, error: adminError } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (adminError) {
        console.error('Error getting admin ID:', adminError);
        throw new Error('No se pudo obtener información del administrador');
      }

      // Actualizar estado en btl_usuarios
      const { error: updateError } = await supabase
        .from('btl_usuarios')
        .update({
          estado_aprobacion: 'approved',
          aprobado_por: adminData.id, // Usar el ID de btl_usuarios, no auth.uid()
          fecha_aprobacion: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Actualizar el user_metadata en auth.users para que puedan acceder
      // Nota: Esto requiere privilegios de admin en Supabase Auth
      // Por ahora, solo actualizamos btl_usuarios y el login verificará el estado
      
      toast.success(`✅ Usuario ${user.nombre} aprobado exitosamente`);
      
      await loadPendingUsers();
      onUpdate();
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error(`Error al aprobar usuario: ${error.message}`);
    } finally {
      setProcessingUserId(null);
      setUserToApprove(null);
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUser) return;
    
    if (!rejectionNote.trim()) {
      toast.error('Por favor ingresa una razón para el rechazo');
      return;
    }

    setProcessingUserId(selectedUser.id);
    try {
      // Primero obtener el ID del admin actual desde btl_usuarios
      const { data: adminData, error: adminError } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (adminError) {
        console.error('Error getting admin ID:', adminError);
        throw new Error('No se pudo obtener información del administrador');
      }

      // Actualizar estado en btl_usuarios
      const { error: updateError } = await supabase
        .from('btl_usuarios')
        .update({
          estado_aprobacion: 'rejected',
          aprobado_por: adminData.id, // Usar el ID de btl_usuarios, no auth.uid()
          fecha_aprobacion: new Date().toISOString(),
          nota_rechazo: rejectionNote,
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      toast.success(`Usuario ${selectedUser.nombre} rechazado`);
      
      setShowRejectionModal(false);
      setSelectedUser(null);
      setRejectionNote('');
      
      await loadPendingUsers();
      onUpdate();
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error(`Error al rechazar usuario: ${error.message}`);
    } finally {
      setProcessingUserId(null);
    }
  };

  const openRejectionModal = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectionModal(true);
    setRejectionNote('');
  };

  const filteredUsers = pendingUsers.filter(user =>
    user.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.rol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'inspector': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'client': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'inspector': return 'Inspector';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-semibold">Solicitudes Pendientes</h2>
          <p className="text-slate-400 text-sm">
            {filteredUsers.length === 0 ? (
              'No hay solicitudes pendientes'
            ) : (
              `${filteredUsers.length} solicitud${filteredUsers.length !== 1 ? 'es' : ''} esperando aprobación`
            )}
          </p>
        </div>
        
        {pendingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">
              {pendingUsers.length} pendiente{pendingUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">Sistema de Aprobación de Usuarios</h4>
            <p className="text-sm text-slate-300">
              Los nuevos usuarios deben ser aprobados por un administrador antes de poder acceder al sistema. 
              Revisa cada solicitud cuidadosamente y verifica que el email corporativo y la información sean correctos.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {pendingUsers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      )}

      {/* Pending Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl text-white font-semibold mb-2">
            {searchQuery ? 'No se encontraron solicitudes' : '¡Todo al día!'}
          </h3>
          <p className="text-slate-400">
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'No hay solicitudes de registro pendientes de aprobación'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                {/* User Info */}
                <div className="flex-1 space-y-3">
                  {/* Name and Role */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {user.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold text-lg">{user.nombre}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.rol)}`}>
                          {getRoleLabel(user.rol)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <Mail className="w-4 h-4" />
                        <span className="break-all">{user.email}</span>
                      </div>
                      {user.empresa && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{user.empresa}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveUser(user)}
                    disabled={processingUserId === user.id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  >
                    {processingUserId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Aprobar</span>
                  </button>
                  <button
                    onClick={() => openRejectionModal(user)}
                    disabled={processingUserId === user.id}
                    className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Rechazar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!userToApprove}
        onClose={() => setUserToApprove(null)}
        onConfirm={confirmApproveUser}
        title="Aprobar Usuario"
        message={`¿Aprobar la solicitud de ${userToApprove?.nombre} (${userToApprove?.email})?`}
        confirmText="Aprobar"
        variant="info"
      />

      {/* Rejection Modal */}
      {showRejectionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg text-white font-semibold">Rechazar Solicitud</h3>
                <p className="text-sm text-slate-400">{selectedUser.nombre}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-2">
                Razón del rechazo <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Explica brevemente por qué se rechaza esta solicitud..."
                rows={4}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedUser(null);
                  setRejectionNote('');
                }}
                disabled={processingUserId !== null}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectUser}
                disabled={processingUserId !== null || !rejectionNote.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {processingUserId === selectedUser.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rechazando...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Confirmar Rechazo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}