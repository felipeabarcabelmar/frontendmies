import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONTRACOS E INTERFACES DE DATOS ---
interface Paso1Planificacion {
  supervisor_asigna: string;
  empresa: string;
  gerencia: string;
  superintendencia_direccion: string;
  fecha: string;
  hora_inicio: string;
  hora_termino: string;
  lugar_especifico: string;
  trabajo_realizar: string;
  activo?: boolean;
}

interface SupervisorChecklist {
  cuenta_con_estandar: boolean;
  nombre_estandar: string;
  personal_capacitado: boolean;
  permiso_areas: boolean;
  verifico_segregacion: boolean;
  sistema_comunicacion: boolean;
  sistema_comunicacion_detalle?: string;
  cuenta_epp: boolean;
}

interface TrabajadorChecklist {
  conoce_estandar: boolean;
  nombre_estandar_trabajador: string;
  competencias_salud: boolean;
  autorizacion_ingreso: boolean;
  segrego_senalizo: boolean;
  conoce_telefono_emergencia: boolean;
  telefono_emergencia_detalle?: string;
  usa_epp_bueno: boolean;
}

interface RiesgoMedidaControl {
  riesgo: string;
  medida_control: string;
}

interface Paso4TrabajosSimultaneo {
  existen_trabajos_simultaneos: boolean;
  coordinacion_lider_cuadrilla: boolean;
  verificacion_cruzada_controles: boolean;
  comunicacion_acciones_control: boolean;
  contexto_simultaneo?: string;
}

interface LiderEquipo {
  nombre: string;
  cargo: string;
  verofico_condiciones: boolean;
  firma: string;
}

interface IntegranteEquipo {
  nombre: string;
  cargo: string;
  confirmo_condiciones: boolean;
  firma: string;
}

interface FilaRiesgo {
  numero: string;
  cumple: boolean;
}

interface RiesgoCriticoEspecifico {
  nombre: string;
  codigo: string;
  filas: FilaRiesgo[];
}

interface FormularioART {
  id: string;
  codigoSeguimiento: string;
  estado: 'APPROVED_WORK_AUTHORIZED' | 'REJECTED_BY_CRITICAL_CONTROL';
  createdAt: string;
  updatedAt: string;
  paso1Planificacion: Paso1Planificacion;
  paso2PreguntasTransversales: {
    supervisor_checklist: SupervisorChecklist;
    trabajador_checklist: TrabajadorChecklist;
    supervisor_riesgo_critico?: RiesgoCriticoEspecifico[];
    trabajador_riesgo_critico?: RiesgoCriticoEspecifico[];
  };
  paso3OtrosRiesgos: RiesgoMedidaControl[];
  paso4TrabajosSimultaneo: Paso4TrabajosSimultaneo;
  paso5EquipoEjecutor: {
    lider: LiderEquipo;
    integrantes: IntegranteEquipo[];
  };
}

interface User {
  id: string;
  usuario: string;
  nombre: string;
  cargo: string;
  email: string;
  perfil: 'Administrador' | 'Supervisor' | 'Operador';
  foto: string;
}

interface ProfilePermissions {
  rol: 'Administrador' | 'Supervisor' | 'Operador';
  screens: {
    Dashboard: boolean;
    Formulario: boolean;
    Historial: boolean;
    Usuarios: boolean;
    Perfiles: boolean;
  };
}

// --- INTERACTIVE DIGITAL SIGNATURE PAD (Finger / Mouse drawing) ---
interface SignaturePadProps {
  value: string; // base64 image png
  onChange: (signatureBase64: string) => void;
  placeholder?: string;
}

function SignaturePad({ value, onChange, placeholder = "Firme aquí con su dedo o mouse" }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 1. Initialize canvas dimensions once on mount to prevent reset on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentWidth = canvas.parentElement?.getBoundingClientRect().width || canvas.parentElement?.clientWidth || canvas.clientWidth || 600;
    canvas.width = parentWidth;
    canvas.height = 150; // Expanded height for ample spacious signing
  }, []);

  // 2. Load or clear the drawing signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1e3a8a'; // Corporate MIES Blue
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (value && value.startsWith('data:image/')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    } else if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onChange(base64);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ position: 'relative', background: '#f8fafc', border: '1.5px dashed var(--input-border)', borderRadius: '10px', overflow: 'hidden', height: '150px', cursor: 'crosshair', touchAction: 'none' }}>
        {!value && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
            ✍️ {placeholder}
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        type="button"
        onClick={clearCanvas}
        className="btn-secondary"
        style={{ alignSelf: 'flex-end', padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
      >
        Limpiar Firma
      </button>

    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function App() {
  // --- ESTADOS DE SESIÓN Y LOGIN ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mies_is_logged_in') === 'true';
  });
  const [loginUser, setLoginUser] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mies_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // --- NAVEGACIÓN Y TABS ---
  const [currentView, setCurrentView] = useState<'Dashboard' | 'Formulario' | 'Historial' | 'Administración'>('Dashboard');
  const [adminActiveTab, setAdminActiveTab] = useState<'Usuarios' | 'Perfiles'>('Usuarios');

  // --- DATOS GLOBALES Y MODAL DE LECTURA ---
  const [artList, setArtList] = useState<FormularioART[]>(() => {
    const saved = localStorage.getItem('mies_art_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [selectedArtForModal, setSelectedArtForModal] = useState<FormularioART | null>(null);

  useEffect(() => {
    localStorage.setItem('mies_art_list', JSON.stringify(artList));
  }, [artList]);

  // --- FILTROS DE HISTORIAL ---
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterSupervisor, setFilterSupervisor] = useState<string>('ALL');

  // --- CONFIGURACIÓN DE PERMISOS POR DEFECTO ---
  const [profilePermissions, setProfilePermissions] = useState<ProfilePermissions[]>([
    {
      rol: 'Administrador',
      screens: { Dashboard: true, Formulario: true, Historial: true, Usuarios: true, Perfiles: true }
    },
    {
      rol: 'Supervisor',
      screens: { Dashboard: true, Formulario: true, Historial: true, Usuarios: false, Perfiles: false }
    },
    {
      rol: 'Operador',
      screens: { Dashboard: false, Formulario: true, Historial: false, Usuarios: false, Perfiles: false }
    }
  ]);

  // --- BASE DE DATOS DE COLABORADORES ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mies_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'usr-1',
        usuario: 'admin',
        nombre: 'Constanza Aránguiz',
        cargo: 'Jefa Nacional HSE - MIES',
        email: 'caranguiz@mies.cl',
        perfil: 'Administrador',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
      },
      {
        id: 'usr-2',
        usuario: 'supervisor',
        nombre: 'Ricardo Alarcón',
        cargo: 'Supervisor HSE Zona Norte',
        email: 'ralarcon@mies.cl',
        perfil: 'Supervisor',
        foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
      },
      {
        id: 'usr-3',
        usuario: 'operador',
        nombre: 'Claudio Tapia',
        cargo: 'Operario Mayor Electricista',
        email: 'ctapia@mies.cl',
        perfil: 'Operador',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mies_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mies_current_user', JSON.stringify(currentUser));
      localStorage.setItem('mies_is_logged_in', isLoggedIn ? 'true' : 'false');
    } else {
      localStorage.removeItem('mies_current_user');
      localStorage.setItem('mies_is_logged_in', 'false');
    }
  }, [currentUser, isLoggedIn]);

  // --- SEED DE FORMULARIOS COMPLEMENTARIOS ---
  const initialSeedARTs: FormularioART[] = [
    {
      id: 'seed-art-1',
      codigoSeguimiento: 'ART-20260528-7692',
      estado: 'APPROVED_WORK_AUTHORIZED',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      paso1Planificacion: {
        supervisor_asigna: 'Ricardo Alarcón',
        empresa: 'MIES S.A.',
        gerencia: 'Minería',
        superintendencia_direccion: 'Chancado',
        fecha: '2026-05-28',
        hora_inicio: '08:30',
        hora_termino: '17:30',
        lugar_especifico: 'Stockpile Primario Chancadora 02',
        trabajo_realizar: 'Mantenimiento Mecánico de Polines y Cinta Transportadora'
      },
      paso2PreguntasTransversales: {
        supervisor_checklist: {
          cuenta_con_estandar: true,
          nombre_estandar: 'ECF 02 - Trabajo en Altura',
          personal_capacitado: true,
          permiso_areas: true,
          verifico_segregacion: true,
          sistema_comunicacion: true,
          cuenta_epp: true
        },
        trabajador_checklist: {
          conoce_estandar: true,
          nombre_estandar_trabajador: 'ECF 02 - Trabajo en Altura',
          competencias_salud: true,
          autorizacion_ingreso: true,
          segrego_senalizo: true,
          conoce_telefono_emergencia: true,
          usa_epp_bueno: true
        }
      },
      paso3OtrosRiesgos: [
        { riesgo: 'Atrapamiento por cinta en movimiento', medida_control: 'Bloqueo LOTO y prueba de energía cero' }
      ],
      paso4TrabajosSimultaneo: {
        existen_trabajos_simultaneos: false,
        coordinacion_lider_cuadrilla: true,
        verificacion_cruzada_controles: true,
        comunicacion_acciones_control: true
      },
      paso5EquipoEjecutor: {
        lider: {
          nombre: 'Ricardo Alarcón',
          cargo: 'Supervisor HSE Zona Norte',
          verofico_condiciones: true,
          firma: 'firma_ricardo_alarcon_99'
        },
        integrantes: [
          { nombre: 'Claudio Tapia', cargo: 'Operario Mayor Electricista', confirmo_condiciones: true, firma: 'firma_claudio_tapia' },
          { nombre: 'Héctor Galdames', cargo: 'Técnico Mecánico', confirmo_condiciones: true, firma: 'firma_hector' }
        ]
      }
    },
    {
      id: 'seed-art-2',
      codigoSeguimiento: 'ART-20260528-9941',
      estado: 'REJECTED_BY_CRITICAL_CONTROL',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      paso1Planificacion: {
        supervisor_asigna: 'Ricardo Alarcón',
        empresa: 'MIES S.A.',
        gerencia: 'Lixiviación',
        superintendencia_direccion: 'Área Húmeda',
        fecha: '2026-05-28',
        hora_inicio: '10:00',
        hora_termino: '18:00',
        lugar_especifico: 'Sala de Bombas de Refino 04',
        trabajo_realizar: 'Cambio de Válvula de Entrada Solución Ácida'
      },
      paso2PreguntasTransversales: {
        supervisor_checklist: {
          cuenta_con_estandar: true,
          nombre_estandar: 'ECF 08 - Sustancias Peligrosas',
          personal_capacitado: true,
          permiso_areas: true,
          verifico_segregacion: true,
          sistema_comunicacion: true,
          cuenta_epp: false // RECHAZO TARJETA VERDE: Supervisor no verificó EPP adecuado
        },
        trabajador_checklist: {
          conoce_estandar: true,
          nombre_estandar_trabajador: 'ECF 08 - Sustancias Peligrosas',
          competencias_salud: true,
          autorizacion_ingreso: true,
          segrego_senalizo: true,
          conoce_telefono_emergencia: true,
          usa_epp_bueno: true
        }
      },
      paso3OtrosRiesgos: [
        { riesgo: 'Contacto dérmico con fluidos ácidos', medida_control: 'Uso de traje encapsulado nivel C y duchas de emergencia operativas' }
      ],
      paso4TrabajosSimultaneo: {
        existen_trabajos_simultaneos: false,
        coordinacion_lider_cuadrilla: true,
        verificacion_cruzada_controles: true,
        comunicacion_acciones_control: true
      },
      paso5EquipoEjecutor: {
        lider: {
          nombre: 'Ricardo Alarcón',
          cargo: 'Supervisor HSE Zona Norte',
          verofico_condiciones: true,
          firma: 'firma_ricardo_alarcon_99'
        },
        integrantes: [
          { nombre: 'Andrés Morales', cargo: 'Técnico de Piping', confirmo_condiciones: true, firma: 'firma_andres_m' }
        ]
      }
    }
  ];

  // --- FETCH DE DATOS API DESDE BACKEND CON CORS CONFIGURADO ---
  const fetchARTs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/formularios-art`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const listParsed = data.map((r: any) => ({
            id: r.id,
            codigoSeguimiento: r.codigoSeguimiento,
            estado: r.estado,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            paso1Planificacion: typeof r.paso1Planificacion === 'string' ? JSON.parse(r.paso1Planificacion) : r.paso1Planificacion,
            paso2PreguntasTransversales: typeof r.paso2PreguntasTransversales === 'string' ? JSON.parse(r.paso2PreguntasTransversales) : r.paso2PreguntasTransversales,
            paso3OtrosRiesgos: typeof r.paso3OtrosRiesgos === 'string' ? JSON.parse(r.paso3OtrosRiesgos) : r.paso3OtrosRiesgos,
            paso4TrabajosSimultaneo: typeof r.paso4TrabajosSimultaneo === 'string' ? JSON.parse(r.paso4TrabajosSimultaneo) : r.paso4TrabajosSimultaneo,
            paso5EquipoEjecutor: typeof r.paso5EquipoEjecutor === 'string' ? JSON.parse(r.paso5EquipoEjecutor) : r.paso5EquipoEjecutor,
          }));
          setArtList([...listParsed, ...initialSeedARTs]);
        } else {
          const saved = localStorage.getItem('mies_art_list');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.length > 0) {
                setArtList(parsed);
                return;
              }
            } catch (e) {}
          }
          setArtList(initialSeedARTs);
        }
      } else {
        const saved = localStorage.getItem('mies_art_list');
        if (saved) {
          try {
            setArtList(JSON.parse(saved));
            return;
          } catch (e) {}
        }
        setArtList(initialSeedARTs);
      }
    } catch (err) {
      console.warn('Persistencia real offline. Cargando datos desde localStorage.');
      console.error('Error al conectar con la API:', err);
      const saved = localStorage.getItem('mies_art_list');
      if (saved) {
        try {
          setArtList(JSON.parse(saved));
          return;
        } catch (e) {}
      }
      setArtList(initialSeedARTs);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchARTs();
    }
  }, [isLoggedIn]);

  const handleDeleteART = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este formulario ART de forma permanente?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/formularios-art/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchARTs();
      } else {
        setArtList(artList.filter(art => art.id !== id));
      }
    } catch (err) {
      console.warn('Backend offline. Realizando eliminación local.');
      setArtList(artList.filter(art => art.id !== id));
    }
  };

  const handleDeleteSeedART = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro semilla local?')) {
      setArtList(artList.filter(art => art.id !== id));
    }
  };

  const handleToggleActivo = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/formularios-art/${id}/toggle-activo`, {
        method: 'PUT'
      });
      if (res.ok) {
        await fetchARTs();
      } else {
        toggleActivoLocal(id);
      }
    } catch (err) {
      console.warn('Backend offline. Realizando cambio de estado local.');
      toggleActivoLocal(id);
    }
  };

  const toggleActivoLocal = (id: string) => {
    const updated = artList.map(art => {
      if (art.id === id) {
        const paso1 = { ...art.paso1Planificacion, activo: art.paso1Planificacion.activo !== false ? false : true };
        return { ...art, paso1Planificacion: paso1 };
      }
      return art;
    });
    setArtList(updated);
  };

  // --- AUTENTICACIÓN LOGOUT Y SELECCIÓN DE PANTALLA ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const foundUser = users.find(u => u.usuario === loginUser);

    if (foundUser && loginPassword === 'admin123') {
      setCurrentUser(foundUser);
      setIsLoggedIn(true);

      const permissions = profilePermissions.find(p => p.rol === foundUser.perfil);
      if (permissions) {
        if (permissions.screens.Dashboard) {
          setCurrentView('Dashboard');
        } else if (permissions.screens.Formulario) {
          setCurrentView('Formulario');
        }
      }
    } else {
      setAuthError('Credenciales incorrectas. Verifique usuario o contraseña (admin123).');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginPassword('');
  };

  // --- PERMISOS DE PANTALLAS ---
  const handlePermissionToggle = (rol: 'Administrador' | 'Supervisor' | 'Operador', screen: keyof ProfilePermissions['screens']) => {
    if (rol === 'Administrador' && screen === 'Perfiles') return; // Impedir auto-bloqueo del administrador

    const updated = profilePermissions.map(p => {
      if (p.rol === rol) {
        return {
          ...p,
          screens: { ...p.screens, [screen]: !p.screens[screen] }
        };
      }
      return p;
    });
    setProfilePermissions(updated);
  };

  const hasAccess = (screen: keyof ProfilePermissions['screens']) => {
    if (!currentUser) return false;
    const permissions = profilePermissions.find(p => p.rol === currentUser.perfil);
    return permissions ? permissions.screens[screen] : false;
  };

  // --- MANTENEDOR DE COLABORADORES (CRUD) ---
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editModeUser, setEditModeUser] = useState<User | null>(null);
  const [formUserNombre, setFormUserNombre] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileNombre, setProfileNombre] = useState<string>('');
  const [profileCargo, setProfileCargo] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profileFoto, setProfileFoto] = useState<string>('');
  const [formUserUsuario, setFormUserUsuario] = useState<string>('');
  const [formUserCargo, setFormUserCargo] = useState<string>('');
  const [formUserEmail, setFormUserEmail] = useState<string>('');
  const [formUserPerfil, setFormUserPerfil] = useState<'Administrador' | 'Supervisor' | 'Operador'>('Operador');
  const [formUserFoto, setFormUserFoto] = useState<string>('');

  const randomAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  ];

  const handleOpenUserModal = (user: User | null = null) => {
    if (user) {
      setEditModeUser(user);
      setFormUserNombre(user.nombre);
      setFormUserUsuario(user.usuario);
      setFormUserCargo(user.cargo);
      setFormUserEmail(user.email);
      setFormUserPerfil(user.perfil);
      setFormUserFoto(user.foto);
    } else {
      setEditModeUser(null);
      setFormUserNombre('');
      setFormUserUsuario('');
      setFormUserCargo('');
      setFormUserEmail('');
      setFormUserPerfil('Operador');
      setFormUserFoto(randomAvatars[Math.floor(Math.random() * randomAvatars.length)]);
    }
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!formUserNombre || !formUserUsuario || !formUserEmail) return;

    if (editModeUser) {
      setUsers(users.map(u => u.id === editModeUser.id ? {
        ...u,
        nombre: formUserNombre,
        usuario: formUserUsuario,
        cargo: formUserCargo,
        email: formUserEmail,
        perfil: formUserPerfil,
        foto: formUserFoto
      } : u));
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        nombre: formUserNombre,
        usuario: formUserUsuario,
        cargo: formUserCargo,
        email: formUserEmail,
        perfil: formUserPerfil,
        foto: formUserFoto
      };
      setUsers([...users, newUser]);
    }
    setShowUserModal(false);
  };

  const handleOpenProfileModal = () => {
    if (currentUser) {
      setProfileNombre(currentUser.nombre);
      setProfileCargo(currentUser.cargo || '');
      setProfileEmail(currentUser.email);
      setProfileFoto(currentUser.foto);
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = () => {
    if (!currentUser || !profileNombre || !profileEmail) return;

    const updatedUser: User = {
      ...currentUser,
      nombre: profileNombre,
      cargo: profileCargo,
      email: profileEmail,
      foto: profileFoto
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setShowProfileModal(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      alert('Operación denegada: No es posible auto-eliminarse de la sesión activa.');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  // --- WIZARD FORM WIDGET IMPLEMENTATION ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardLoading, setWizardLoading] = useState<boolean>(false);
  const [wizardResult, setWizardResult] = useState<any | null>(null);

  const [paso1, setPaso1] = useState<Paso1Planificacion>({
    supervisor_asigna: '',
    empresa: 'MIES S.A.',
    gerencia: '',
    superintendencia_direccion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_termino: '',
    lugar_especifico: '',
    trabajo_realizar: ''
  });

  const [supervisorCheck, setSupervisorCheck] = useState<SupervisorChecklist>({
    cuenta_con_estandar: true,
    nombre_estandar: '',
    personal_capacitado: true,
    permiso_areas: true,
    verifico_segregacion: true,
    sistema_comunicacion: true,
    cuenta_epp: true
  });

  const [trabajadorCheck, setTrabajadorCheck] = useState<TrabajadorChecklist>({
    conoce_estandar: true,
    nombre_estandar_trabajador: '',
    telefono_emergencia_detalle: '',
    competencias_salud: true,
    autorizacion_ingreso: true,
    segrego_senalizo: true,
    conoce_telefono_emergencia: true,
    usa_epp_bueno: true
  });

  const [supervisorRiesgosCriticos, setSupervisorRiesgosCriticos] = useState<RiesgoCriticoEspecifico[]>([]);
  const [trabajadorRiesgosCriticos, setTrabajadorRiesgosCriticos] = useState<RiesgoCriticoEspecifico[]>([]);

  const PREDEFINED_RISKS = [
    { nombre: 'Incendios', codigo: '06' },
    { nombre: 'Sustancias químicas peligrosas', codigo: '02' },
    { nombre: 'Choque', codigo: '03' },
    { nombre: 'Volcamiento', codigo: '04' },
    { nombre: 'Atropello', codigo: '05' }
  ];

  const initRiesgoCritico = (nombre: string): RiesgoCriticoEspecifico => {
    const filas: FilaRiesgo[] = [];
    for (let i = 1; i <= 10; i++) {
      filas.push({ numero: '', cumple: true }); // preset to empty string as per request, with cumple preset to true (SI)
    }
    return { nombre, codigo: '', filas }; // preset to empty string for code
  };

  const handleSelectRisk = (type: 'supervisor' | 'trabajador', riskName: string) => {
    const initialized = initRiesgoCritico(riskName);
    if (type === 'supervisor') {
      setSupervisorRiesgosCriticos([...supervisorRiesgosCriticos, initialized]);
    } else {
      setTrabajadorRiesgosCriticos([...trabajadorRiesgosCriticos, initialized]);
    }
  };

  const handleCustomRiskInit = (type: 'supervisor' | 'trabajador') => {
    const initialized = initRiesgoCritico('');
    if (type === 'supervisor') {
      setSupervisorRiesgosCriticos([...supervisorRiesgosCriticos, initialized]);
    } else {
      setTrabajadorRiesgosCriticos([...trabajadorRiesgosCriticos, initialized]);
    }
  };

  const handleRemoveRisk = (type: 'supervisor' | 'trabajador', index: number) => {
    if (type === 'supervisor') {
      setSupervisorRiesgosCriticos(supervisorRiesgosCriticos.filter((_, i) => i !== index));
    } else {
      setTrabajadorRiesgosCriticos(trabajadorRiesgosCriticos.filter((_, i) => i !== index));
    }
  };

  const handleRiskFieldChange = (type: 'supervisor' | 'trabajador', index: number, field: 'nombre' | 'codigo', value: string) => {
    if (type === 'supervisor') {
      const updated = supervisorRiesgosCriticos.map((risk, i) => {
        if (i === index) {
          return { ...risk, [field]: value };
        }
        return risk;
      });
      setSupervisorRiesgosCriticos(updated);
    } else {
      const updated = trabajadorRiesgosCriticos.map((risk, i) => {
        if (i === index) {
          return { ...risk, [field]: value };
        }
        return risk;
      });
      setTrabajadorRiesgosCriticos(updated);
    }
  };

  const handleRowChange = (type: 'supervisor' | 'trabajador', riskIndex: number, rowIndex: number, field: 'numero' | 'cumple', value: any) => {
    if (type === 'supervisor') {
      const updated = supervisorRiesgosCriticos.map((risk, i) => {
        if (i === riskIndex) {
          const updatedFilas = risk.filas.map((row, j) => {
            if (j === rowIndex) {
              return { ...row, [field]: value };
            }
            return row;
          });
          return { ...risk, filas: updatedFilas };
        }
        return risk;
      });
      setSupervisorRiesgosCriticos(updated);
    } else {
      const updated = trabajadorRiesgosCriticos.map((risk, i) => {
        if (i === riskIndex) {
          const updatedFilas = risk.filas.map((row, j) => {
            if (j === rowIndex) {
              return { ...row, [field]: value };
            }
            return row;
          });
          return { ...risk, filas: updatedFilas };
        }
        return risk;
      });
      setTrabajadorRiesgosCriticos(updated);
    }
  };


  const [paso3, setPaso3] = useState<RiesgoMedidaControl[]>([
    { riesgo: 'Pérdida de equilibrio en altura', medida_control: 'Uso obligatorio de arnés enganchado a línea de vida independiente' }
  ]);

  const [paso4, setPaso4] = useState<Paso4TrabajosSimultaneo>({
    existen_trabajos_simultaneos: false,
    contexto_simultaneo: '',
    coordinacion_lider_cuadrilla: true,
    verificacion_cruzada_controles: true,
    comunicacion_acciones_control: true
  });

  const [lider, setLider] = useState<LiderEquipo>({
    nombre: '',
    cargo: 'Líder de Cuadrilla',
    verofico_condiciones: true,
    firma: ''
  });

  const [integrantes, setIntegrantes] = useState<IntegranteEquipo[]>([
    { nombre: '', cargo: 'Técnico Operador', confirmo_condiciones: true, firma: '' }
  ]);

  // --- HELPERS Y FUNCIONES DE CONTROL DE RIESGOS ---
  const isAnyGreenCardTriggered = () => {
    return (
      !supervisorCheck.cuenta_con_estandar ||
      !supervisorCheck.personal_capacitado ||
      !supervisorCheck.permiso_areas ||
      !supervisorCheck.verifico_segregacion ||
      !supervisorCheck.sistema_comunicacion ||
      !supervisorCheck.cuenta_epp ||
      !trabajadorCheck.conoce_estandar ||
      !trabajadorCheck.competencias_salud ||
      !trabajadorCheck.autorizacion_ingreso ||
      !trabajadorCheck.segrego_senalizo ||
      !trabajadorCheck.conoce_telefono_emergencia ||
      !trabajadorCheck.usa_epp_bueno
    );
  };

  const handleRiesgoChange = (index: number, field: keyof RiesgoMedidaControl, value: string) => {
    const updated = paso3.map((r, i) => {
      if (i === index) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setPaso3(updated);
  };

  const handleAddRiesgo = () => {
    setPaso3([...paso3, { riesgo: '', medida_control: '' }]);
  };

  const handleRemoveRiesgo = (index: number) => {
    setPaso3(paso3.filter((_, i) => i !== index));
  };

  const handleIntegranteChange = (index: number, field: keyof IntegranteEquipo, value: any) => {
    const updated = integrantes.map((int, i) => {
      if (i === index) {
        return { ...int, [field]: value };
      }
      return int;
    });
    setIntegrantes(updated);
  };

  const handleAddIntegrante = () => {
    setIntegrantes([...integrantes, { nombre: '', cargo: 'Técnico Operador', confirmo_condiciones: true, firma: '' }]);
  };

  const handleRemoveIntegrante = (index: number) => {
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardLoading(true);

    const payload = {
      paso1_planificacion: paso1,
      paso2_preguntas_transversales: {
        supervisor_checklist: supervisorCheck,
        trabajador_checklist: trabajadorCheck,
        supervisor_riesgo_critico: supervisorRiesgosCriticos,
        trabajador_riesgo_critico: trabajadorRiesgosCriticos
      },
      paso3_otros_riesgos: paso3.filter(r => r.riesgo && r.medida_control),
      paso4_trabajos_simultaneo: paso4,
      paso5_equipo_ejecutor: { lider, integrantes }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/formularios-art`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      const newART: FormularioART = {
        id: data.id_formulario || `art-${Date.now()}`,
        codigoSeguimiento: data.codigo_seguimiento || `ART-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        estado: data.estado || (isAnyGreenCardTriggered() ? 'REJECTED_BY_CRITICAL_CONTROL' : 'APPROVED_WORK_AUTHORIZED'),
        createdAt: data.fecha_ingreso || new Date().toISOString(),
        updatedAt: data.fecha_ingreso || new Date().toISOString(),
        paso1Planificacion: paso1,
        paso2PreguntasTransversales: {
          supervisor_checklist: supervisorCheck,
          trabajador_checklist: trabajadorCheck,
          supervisor_riesgo_critico: supervisorRiesgosCriticos,
          trabajador_riesgo_critico: trabajadorRiesgosCriticos
        },
        paso3OtrosRiesgos: paso3,
        paso4TrabajosSimultaneo: paso4,
        paso5EquipoEjecutor: { lider, integrantes }
      };

      // Recargar la lista desde el servidor para reflejar la persistencia real de la base de datos SQLite
      await fetchARTs();
      setWizardResult(newART);
      setWizardStep(6);
    } catch (err) {
      // Simulación local en caso de desconexión del backend
      const isGreenCard = isAnyGreenCardTriggered();
      const newART: FormularioART = {
        id: `art-sim-${Date.now()}`,
        codigoSeguimiento: `ART-SIM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        estado: isGreenCard ? 'REJECTED_BY_CRITICAL_CONTROL' : 'APPROVED_WORK_AUTHORIZED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paso1Planificacion: paso1,
        paso2PreguntasTransversales: {
          supervisor_checklist: supervisorCheck,
          trabajador_checklist: trabajadorCheck,
          supervisor_riesgo_critico: supervisorRiesgosCriticos,
          trabajador_riesgo_critico: trabajadorRiesgosCriticos
        },
        paso3OtrosRiesgos: paso3,
        paso4TrabajosSimultaneo: paso4,
        paso5EquipoEjecutor: { lider, integrantes }
      };

      setArtList([newART, ...artList]);
      setWizardResult(newART);
      setWizardStep(6);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleWizardReset = () => {
    setWizardStep(1);
    setWizardResult(null);
    setPaso1({
      supervisor_asigna: '',
      empresa: 'MIES S.A.',
      gerencia: '',
      superintendencia_direccion: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '',
      hora_termino: '',
      lugar_especifico: '',
      trabajo_realizar: ''
    });
    setSupervisorCheck({
      cuenta_con_estandar: true,
      nombre_estandar: '',
      personal_capacitado: true,
      permiso_areas: true,
      verifico_segregacion: true,
      sistema_comunicacion: true,
      cuenta_epp: true
    });
    setTrabajadorCheck({
      conoce_estandar: true,
      nombre_estandar_trabajador: '',
      telefono_emergencia_detalle: '',
      competencias_salud: true,
      autorizacion_ingreso: true,
      segrego_senalizo: true,
      conoce_telefono_emergencia: true,
      usa_epp_bueno: true
    });
    setSupervisorRiesgosCriticos([]);
    setTrabajadorRiesgosCriticos([]);
    setPaso3([{ riesgo: 'Pérdida de equilibrio en altura', medida_control: 'Uso obligatorio de arnés enganchado a línea de vida independiente' }]);
    setPaso4({
      existen_trabajos_simultaneos: false,
      contexto_simultaneo: '',
      coordinacion_lider_cuadrilla: true,
      verificacion_cruzada_controles: true,
      comunicacion_acciones_control: true
    });
    setLider({ nombre: '', cargo: 'Líder de Cuadrilla', verofico_condiciones: true, firma: '' });
    setIntegrantes([{ nombre: '', cargo: 'Técnico Operador', confirmo_condiciones: true, firma: '' }]);
  };

  // --- FILTROS DE HISTORIAL ---
  const filteredARTs = artList.filter(art => {
    const textQuery = filterSearch.toLowerCase();
    const matchesText =
      art.codigoSeguimiento.toLowerCase().includes(textQuery) ||
      art.paso1Planificacion.supervisor_asigna.toLowerCase().includes(textQuery) ||
      art.paso1Planificacion.lugar_especifico.toLowerCase().includes(textQuery) ||
      art.paso1Planificacion.trabajo_realizar.toLowerCase().includes(textQuery);

    const matchesState = filterState === 'ALL' || art.estado === filterState;
    const matchesSupervisor = filterSupervisor === 'ALL' || art.paso1Planificacion.supervisor_asigna === filterSupervisor;

    let matchesDate = true;
    if (filterDateFrom) {
      matchesDate = matchesDate && new Date(art.createdAt) >= new Date(filterDateFrom);
    }
    if (filterDateTo) {
      const endDate = new Date(filterDateTo);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(art.createdAt) <= endDate;
    }

    return matchesText && matchesState && matchesSupervisor && matchesDate;
  });

  // --- MÉTRICAS DE DASHBOARD ---
  const totalCount = filteredARTs.length;
  const approvedCount = filteredARTs.filter(a => a.estado === 'APPROVED_WORK_AUTHORIZED').length;
  const rejectedCount = filteredARTs.filter(a => a.estado === 'REJECTED_BY_CRITICAL_CONTROL').length;
  const rateRejected = totalCount > 0 ? ((rejectedCount / totalCount) * 100).toFixed(1) : '0.0';

  const supervisoresUnicos = Array.from(new Set(artList.map(a => a.paso1Planificacion.supervisor_asigna))).filter(Boolean);

  // --- RENDERS DE SUB-VISTAS ---
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <img src="https://www.mies.cl/img/logo.svg" alt="MIES Logo" className="login-logo" style={{ margin: '0 auto 25px auto' }} />

          <div className="login-header">
            <h2>Portal de Ingesta ART</h2>
            <p>Ingrese sus credenciales corporativas para continuar.</p>
          </div>

          {authError && (
            <div className="alert-banner error" style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label>Usuario corporativo</label>
              <select
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                style={{ width: '100%' }}
                className="w-full text-slate-800 dark:text-slate-800"
              >
                <option value="admin">Administrador (admin)</option>
                <option value="supervisor">Supervisor (supervisor)</option>
                <option value="operador">Operador (operador)</option>
              </select>
            </div>

            <div className="login-form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Ingrese contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <button type="submit" className="login-btn">Iniciar Sesión</button>
          </form>

          <div className="login-footer">
            <span>Contraseña Demo: admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR NAVIGATION MASTER PANEL */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="https://www.mies.cl/img/logo.svg" alt="MIES" className="sidebar-logo" />
          <span className="sidebar-logo-text">MIES HSE</span>
        </div>

        <div className="sidebar-profile-card" onClick={handleOpenProfileModal} style={{ cursor: 'pointer' }} title="Haga clic para actualizar su perfil">
          <div className="profile-banner"></div>
          <div className="profile-avatar-wrap">
            <img src={currentUser.foto} alt={currentUser.nombre} className="sidebar-avatar" />
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser.nombre}</span>
            <span className="profile-title">{currentUser.cargo} ({currentUser.perfil})</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          {hasAccess('Dashboard') && (
            <li>
              <button
                className={`menu-item ${currentView === 'Dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('Dashboard')}
              >
                <span className="menu-item-icon">📊</span>
                <span className="menu-item-text">Panel de Control</span>
              </button>
            </li>
          )}
          {hasAccess('Formulario') && (
            <li>
              <button
                className={`menu-item ${currentView === 'Formulario' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('Formulario');
                  handleWizardReset();
                }}
              >
                <span className="menu-item-icon">📝</span>
                <span className="menu-item-text">Nuevo Formulario ART</span>
              </button>
            </li>
          )}
          {hasAccess('Historial') && (
            <li>
              <button
                className={`menu-item ${currentView === 'Historial' ? 'active' : ''}`}
                onClick={() => setCurrentView('Historial')}
              >
                <span className="menu-item-icon">🗂️</span>
                <span className="menu-item-text">Historial de Formularios</span>
              </button>
            </li>
          )}
          {(hasAccess('Usuarios') || hasAccess('Perfiles')) && (
            <li>
              <button
                className={`menu-item ${currentView === 'Administración' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('Administración');
                  if (hasAccess('Usuarios')) setAdminActiveTab('Usuarios');
                  else setAdminActiveTab('Perfiles');
                }}
              >
                <span className="menu-item-icon">⚙️</span>
                <span className="menu-item-text">Administración</span>
              </button>
            </li>
          )}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪 Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* VIEWPORT AREA CONTROLLER */}
      <main className="main-content">

        {selectedArtForModal ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>

            {/* VIEW HEADER WITH BACK BUTTON */}
            <div className="view-header print-avoid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Expediente ART Digitalizado</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Consulte el documento oficial de Análisis de Riesgo del Trabajo de forma íntegra.
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setSelectedArtForModal(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontWeight: 'bold' }}
              >
                ← Volver al Historial
              </button>
            </div>

            {/* FULL WIDTH PAPER SHEET CONTAINER */}
            <div style={{ backgroundColor: '#e2e8f0', padding: '30px', borderRadius: '16px', border: '1px solid var(--card-border)', marginBottom: '25px' }} className="print-no-bg-padding">

              {/* REALISTIC TYPED PAPER SHEET */}
              <div className="paper-sheet" style={{ maxWidth: '1000px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
                <div className="paper-watermark">MIES HSE</div>

                {/* PAPER HEADER ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #1f2937', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#1e3a8a', width: '36px', height: '36px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifySelf: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', justifyContent: 'center' }}>M</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>MIES SEGURIDAD INDUSTRIAL</h4>
                      <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#4b5563', fontWeight: 'bold' }}>ANÁLISIS DE RIESGO DEL TRABAJO (ART)</span>
                      <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px', fontWeight: '600' }}>
                        Emisión: {new Date(selectedArtForModal.createdAt).toLocaleString()} | ID: {selectedArtForModal.id}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '6px' }}>
                    <div className={`rubber-stamp ${selectedArtForModal.estado === 'APPROVED_WORK_AUTHORIZED' ? '' : 'rejected'}`}>
                      {selectedArtForModal.estado === 'APPROVED_WORK_AUTHORIZED' ? '✓ TRABAJO AUTORIZADO' : '✗ FAENA RECHAZADA'}
                    </div>
                    <div style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: selectedArtForModal.paso1Planificacion.activo !== false ? '#d1fae5' : '#fee2e2',
                      color: selectedArtForModal.paso1Planificacion.activo !== false ? '#065f46' : '#991b1b',
                      border: `1px solid ${selectedArtForModal.paso1Planificacion.activo !== false ? '#34d399' : '#f87171'}`,
                      display: 'inline-block'
                    }}>
                      Estado: {selectedArtForModal.paso1Planificacion.activo !== false ? '✅ VIGENTE (ACTIVO)' : '❌ INACTIVO'}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 1: PLANIFICACIÓN */}
                <div className="paper-section">
                  <div className="paper-section-title">Paso 1: Planificación y Fechas Generales</div>
                  <div className="paper-grid">
                    <div className="paper-cell"><span className="paper-cell-label">Supervisor que Asigna</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.supervisor_asigna}</span></div>
                    <div className="paper-cell"><span className="paper-cell-label">Empresa Ejecutora</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.empresa}</span></div>
                    <div className="paper-cell"><span className="paper-cell-label">Gerencia Faena</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.gerencia}</span></div>
                    <div className="paper-cell"><span className="paper-cell-label">Superintendencia</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.superintendencia_direccion || 'N/A'}</span></div>
                    <div className="paper-cell"><span className="paper-cell-label">Fecha Faena</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.fecha}</span></div>
                    <div className="paper-cell"><span className="paper-cell-label">Rango Horario</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.hora_inicio} a {selectedArtForModal.paso1Planificacion.hora_termino}</span></div>
                    <div className="paper-cell span-3"><span className="paper-cell-label">Lugar Específico</span><span className="paper-cell-value">{selectedArtForModal.paso1Planificacion.lugar_especifico}</span></div>
                    <div className="paper-cell span-3"><span className="paper-cell-label">Trabajo Detallado a Realizar</span><span className="paper-cell-value" style={{ fontStyle: 'italic' }}>"{selectedArtForModal.paso1Planificacion.trabajo_realizar}"</span></div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTROLES CRÍTICOS (TABLA COMPARATIVA CRUZADA) */}
                <div className="paper-section">
                  <div className="paper-section-title">Paso 2: Controles Críticos de Seguridad (Tarjeta Verde)</div>
                  <div style={{ overflowX: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #1f2937' }}>
                          <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', width: '6%', fontWeight: '800', textAlign: 'center' }}>N°</th>
                          <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', width: '54%', fontWeight: '800' }}>Control Crítico Mandatorio (Tarjeta Verde)</th>
                          <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', width: '20%', fontWeight: '800', textAlign: 'center', color: '#1e3a8a' }}>A. Líder / Supervisor</th>
                          <th style={{ padding: '8px 10px', width: '20%', fontWeight: '800', textAlign: 'center', color: '#7c3aed' }}>B. Trabajador / Cuadrilla</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: 1,
                            supQuestion: "¿El trabajo que asignaré cuenta con un estándar, procedimiento y/o instructivo?",
                            trabQuestion: "¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.cuenta_con_estandar
                              ? `✓ SÍ (${selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.nombre_estandar})`
                              : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.cuenta_con_estandar,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.conoce_estandar
                              ? `✓ SÍ (${selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.nombre_estandar_trabajador})`
                              : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.conoce_estandar
                          },
                          {
                            id: 2,
                            supQuestion: "¿El personal que asignaré para realizar el trabajo, cuenta con las capacitaciones, competencias, salud compatible y/o acreditaciones requeridas?",
                            trabQuestion: "¿Cuento con las competencias y salud compatible para ejecutar el trabajo?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.personal_capacitado ? "✓ SÍ (Habilitado)" : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.personal_capacitado,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.competencias_salud ? "✓ SÍ (Apto)" : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.competencias_salud
                          },
                          {
                            id: 3,
                            supQuestion: "¿Durante la planificación del trabajo, me aseguro de solicitar los permisos para ingresar a las áreas, intervenir equipos y/o interactuar con energías?",
                            trabQuestion: "¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.permiso_areas ? "✓ SÍ (Aprobado)" : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.permiso_areas,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.autorizacion_ingreso ? "✓ SÍ (Autorizado)" : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.autorizacion_ingreso
                          },
                          {
                            id: 4,
                            supQuestion: "¿Verifiqué que el personal cuenta con los elementos requeridos para realizar la segregación y señalización del área de trabajo, según diseño?",
                            trabQuestion: "¿Segregué y señalicé el área de trabajo con los elementos según diseño?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.verifico_segregacion ? "✓ SÍ (Instalado)" : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.verifico_segregacion,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.segrego_senalizo ? "✓ SÍ (Delimitado)" : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.segrego_senalizo
                          },
                          {
                            id: 5,
                            supQuestion: "¿El personal a mi cargo cuenta con sistema de comunicación de acuerdo al protocolo de emergencia del área?",
                            trabQuestion: "¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, según protocolo del área?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.sistema_comunicacion
                              ? `✓ SÍ (Probado${selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.sistema_comunicacion_detalle ? ': ' + selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.sistema_comunicacion_detalle : ''})`
                              : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.sistema_comunicacion,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.conoce_telefono_emergencia
                              ? `✓ SÍ (Informado${selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.telefono_emergencia_detalle ? ': ' + selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.telefono_emergencia_detalle : ''})`
                              : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.conoce_telefono_emergencia
                          },
                          {
                            id: 6,
                            supQuestion: "¿El personal que asignaré para realizar el trabajo, cuenta con los EPP definidos en el procedimiento de trabajo?",
                            trabQuestion: "¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?",
                            sup: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.cuenta_epp ? "✓ SÍ (Entregado)" : "✗ NO",
                            supOk: selectedArtForModal.paso2PreguntasTransversales.supervisor_checklist.cuenta_epp,
                            trab: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.usa_epp_bueno ? "✓ SÍ (Operativo 100%)" : "✗ NO",
                            trabOk: selectedArtForModal.paso2PreguntasTransversales.trabajador_checklist.usa_epp_bueno
                          }
                        ].map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '0.5px solid #cbd5e1', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>{row.id}</td>
                            <td style={{ padding: '6px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '500' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '10.5px' }}>
                                  <strong style={{ color: '#1e3a8a' }}>S: </strong>
                                  {row.supQuestion}
                                </div>
                                <div style={{ fontSize: '10.5px', borderTop: '0.5px dashed #cbd5e1', paddingTop: '4px' }}>
                                  <strong style={{ color: '#7c3aed' }}>T: </strong>
                                  {row.trabQuestion}
                                </div>
                              </div>
                            </td>
                            <td style={{
                              padding: '6px 10px',
                              borderRight: '1px solid #cbd5e1',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: row.supOk ? '#16a34a' : '#dc2626',
                              backgroundColor: row.supOk ? '#f0fdf4' : '#fef2f2'
                            }}>
                              {row.sup}
                            </td>
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: row.trabOk ? '#16a34a' : '#dc2626',
                              backgroundColor: row.trabOk ? '#f0fdf4' : '#fef2f2'
                            }}>
                              {row.trab}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* NUEVO SUB-BLOQUE: RIESGOS CRÍTICOS ESPECÍFICOS DEL TRABAJO EN EL EXPEDIENTE */}
                  {(() => {
                    const supRisks = Array.isArray(selectedArtForModal.paso2PreguntasTransversales.supervisor_riesgo_critico)
                      ? selectedArtForModal.paso2PreguntasTransversales.supervisor_riesgo_critico
                      : (selectedArtForModal.paso2PreguntasTransversales.supervisor_riesgo_critico ? [selectedArtForModal.paso2PreguntasTransversales.supervisor_riesgo_critico] : []);

                    const trabRisks = Array.isArray(selectedArtForModal.paso2PreguntasTransversales.trabajador_riesgo_critico)
                      ? selectedArtForModal.paso2PreguntasTransversales.trabajador_riesgo_critico
                      : (selectedArtForModal.paso2PreguntasTransversales.trabajador_riesgo_critico ? [selectedArtForModal.paso2PreguntasTransversales.trabajador_riesgo_critico] : []);

                    if (supRisks.length === 0 && trabRisks.length === 0) return null;

                    return (
                      <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '12px', paddingTop: '12px' }} className="print-avoid-break">
                        <div style={{ textTransform: 'uppercase', color: '#1e3a8a', fontWeight: '800', fontSize: '11px', marginBottom: '8px' }}>
                          ⚠️ Riesgos Críticos Específicos del Trabajo (Grillas de Controles)
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          {/* GRUPO SUPERVISOR */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <strong style={{ textTransform: 'uppercase', color: '#1e3a8a', fontSize: '10px' }}>Supervisor(a):</strong>
                            {supRisks.length > 0 ? (
                              supRisks.map((risk, rIdx) => (
                                <div key={rIdx} style={{ border: '1px solid #94a3b8', borderRadius: '6px', overflow: 'hidden' }}>
                                  <div style={{ background: '#475569', color: '#ffffff', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                                    <span>{risk.nombre}</span>
                                    {risk.codigo && <span>CÓD: {risk.codigo}</span>}
                                  </div>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                                    <thead>
                                      <tr style={{ background: '#e2e8f0', color: '#1e293b' }}>
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '40%' }}>N°</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '30%' }}>SI</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '30%' }}>NO</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {risk.filas.map((row, idx) => (
                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>
                                            {row.numero ? `N° ${row.numero}` : '-'}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                                            {row.cumple ? '✓' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                                            {!row.cumple ? '✗' : ''}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '10px', padding: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                                Sin riesgos críticos específicos.
                              </div>
                            )}
                          </div>

                          {/* GRUPO TRABAJADOR */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <strong style={{ textTransform: 'uppercase', color: '#8b5cf6', fontSize: '10px' }}>Trabajador(a):</strong>
                            {trabRisks.length > 0 ? (
                              trabRisks.map((risk, rIdx) => (
                                <div key={rIdx} style={{ border: '1px solid #c084fc', borderRadius: '6px', overflow: 'hidden' }}>
                                  <div style={{ background: '#7c3aed', color: '#ffffff', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                                    <span>{risk.nombre}</span>
                                    {risk.codigo && <span>CÓD: {risk.codigo}</span>}
                                  </div>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                                    <thead>
                                      <tr style={{ background: '#f3e8ff', color: '#5b21b6' }}>
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '40%' }}>N°</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '30%' }}>SI</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '30%' }}>NO</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {risk.filas.map((row, idx) => (
                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fcf8ff' }}>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold' }}>
                                            {row.numero ? `N° ${row.numero}` : '-'}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                                            {row.cumple ? '✓' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                                            {!row.cumple ? '✗' : ''}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '10px', padding: '10px', background: '#fcf8ff', border: '1px dashed #e9d5ff', borderRadius: '6px' }}>
                                Sin riesgos críticos específicos.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* SECCIÓN 3: OTROS RIESGOS ESPECÍFICOS */}
                <div className="paper-section">
                  <div className="paper-section-title">Paso 3: Identificación de Riesgos Específicos Localizados</div>
                  <div style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #1f2937' }}>
                          <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', width: '5%', fontWeight: '800', textAlign: 'center' }}>N°</th>
                          <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', width: '45%', fontWeight: '800' }}>Peligro / Riesgo Específico</th>
                          <th style={{ padding: '8px 10px', width: '50%', fontWeight: '800' }}>Medida Mitigadora / Control Asignado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedArtForModal.paso3OtrosRiesgos && selectedArtForModal.paso3OtrosRiesgos.length > 0 ? (
                          selectedArtForModal.paso3OtrosRiesgos.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '0.5px solid #cbd5e1', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                              <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                              <td style={{ padding: '6px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '600' }}>{r.riesgo}</td>
                              <td style={{ padding: '6px 10px', color: '#334155' }}>{r.medida_control}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} style={{ padding: '15px', textTransform: 'uppercase', fontStyle: 'italic', textAlign: 'center', color: '#94a3b8' }}>
                              No se declararon otros riesgos ni medidas de mitigación localizadas en esta obra.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECCIÓN 4: COORDINACIÓN SIMULTÁNEA */}
                <div className="paper-section">
                  <div className="paper-section-title">Paso 4: Coordinación Operativa de Faenas Simultáneas</div>
                  <div style={{ padding: '15px', fontSize: '11px' }}>
                    {selectedArtForModal.paso4TrabajosSimultaneo?.existen_trabajos_simultaneos ? (
                      <div>
                        <div style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          color: '#b45309',
                          fontWeight: '700',
                          marginBottom: '12px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ⚠️ SE DECLARARON TRABAJOS SIMULTÁNEOS O INTERFERENCIAS EN LA ZONA DE FAENA
                        </div>
                        {selectedArtForModal.paso4TrabajosSimultaneo.contexto_simultaneo && (
                          <div style={{
                            backgroundColor: '#fafafa',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            marginBottom: '12px',
                            fontSize: '11px',
                            color: '#334155'
                          }}>
                            <strong>Contexto de Simultaneidad Declarado:</strong> {selectedArtForModal.paso4TrabajosSimultaneo.contexto_simultaneo}
                          </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                          <thead>
                            <tr style={{ background: '#fef3c7', color: '#92400e' }}>
                              <th style={{ padding: '6px 8px', border: '1px solid #fcd34d', textAlign: 'left', width: '80%' }}>Controles de Coordinación Mandatorios</th>
                              <th style={{ padding: '6px 8px', border: '1px solid #fcd34d', textAlign: 'center', width: '20%' }}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a' }}>1. Coordinación de delimitación de áreas y faenas con Líder aledaño</td>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a', textAlign: 'center', fontWeight: 'bold', color: selectedArtForModal.paso4TrabajosSimultaneo.coordinacion_lider_cuadrilla ? '#16a34a' : '#dc2626' }}>
                                {selectedArtForModal.paso4TrabajosSimultaneo.coordinacion_lider_cuadrilla ? '✓ CUMPLIDO (SÍ)' : '✗ NO CUMPLIDO'}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a' }}>2. Realización de verificación cruzada de interferencia de actividades</td>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a', textAlign: 'center', fontWeight: 'bold', color: selectedArtForModal.paso4TrabajosSimultaneo.verificacion_cruzada_controles ? '#16a34a' : '#dc2626' }}>
                                {selectedArtForModal.paso4TrabajosSimultaneo.verificacion_cruzada_controles ? '✓ CUMPLIDO (SÍ)' : '✗ NO CUMPLIDO'}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a' }}>3. Plan de acción y vías de escape difundidas a todo el personal</td>
                              <td style={{ padding: '6px 8px', border: '1px solid #fde68a', textAlign: 'center', fontWeight: 'bold', color: selectedArtForModal.paso4TrabajosSimultaneo.comunicacion_acciones_control ? '#16a34a' : '#dc2626' }}>
                                {selectedArtForModal.paso4TrabajosSimultaneo.comunicacion_acciones_control ? '✓ CUMPLIDO (SÍ)' : '✗ NO CUMPLIDO'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #dcfce7',
                        borderRadius: '6px',
                        padding: '12px',
                        color: '#15803d',
                        fontWeight: '600',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ℹ️ TRABAJO INDEPENDIENTE: No se registraron actividades simultáneas ni interferencias con otras cuadrillas en la zona.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 5: EQUIPO EJECUTOR, DECLARACIONES Y FIRMAS */}
                <div className="paper-section" style={{ marginBottom: '0' }}>
                  <div className="paper-section-title">Paso 5: Listado de Cuadrilla Habilitada y Firmas Electrónicas</div>
                  <div style={{ padding: '15px', fontSize: '11px' }}>

                    {/* CUADRO LÍDER */}
                    <div style={{
                      border: '1px solid #1e3a8a',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#f8fafc',
                      marginBottom: '15px',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr',
                      gap: '15px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '4px' }}>
                          🛡️ Líder de Cuadrilla
                        </div>
                        <div style={{ fontSize: '11px', color: '#334155' }}>
                          <strong>Nombre:</strong> {selectedArtForModal.paso5EquipoEjecutor.lider.nombre}
                        </div>
                        <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                          <strong>Cargo:</strong> {selectedArtForModal.paso5EquipoEjecutor.lider.cargo}
                        </div>
                        <div style={{
                          marginTop: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: selectedArtForModal.paso5EquipoEjecutor.lider.verofico_condiciones ? '#15803d' : '#b91c1c',
                          backgroundColor: selectedArtForModal.paso5EquipoEjecutor.lider.verofico_condiciones ? '#e6f4ea' : '#fce8e6',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {selectedArtForModal.paso5EquipoEjecutor.lider.verofico_condiciones
                            ? '✓ Declaración: Validó aptitud del 100% de la cuadrilla en terreno'
                            : '✗ Declaración: No validó la aptitud completa de la cuadrilla'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', borderLeft: '1px dashed #cbd5e1', paddingLeft: '15px' }}>
                        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>
                          Firma Digital Autorizada
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '55px' }}>
                          {selectedArtForModal.paso5EquipoEjecutor.lider.firma && selectedArtForModal.paso5EquipoEjecutor.lider.firma.startsWith('data:image/') ? (
                            <img src={selectedArtForModal.paso5EquipoEjecutor.lider.firma} alt="Firma del Líder" style={{ maxHeight: '50px', maxWidth: '100%', display: 'block', mixBlendMode: 'multiply' }} />
                          ) : (
                            <span className="typewritten-signature" style={{ fontSize: '12px' }}>
                              {selectedArtForModal.paso5EquipoEjecutor.lider.firma || '(Sin Firma)'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>
                          Timestamp: {new Date(selectedArtForModal.createdAt).toLocaleDateString()} {selectedArtForModal.paso1Planificacion.hora_inicio || ''}
                        </div>
                      </div>
                    </div>

                    {/* CUADRO OPERARIOS */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Compartir y Firmas de la Cuadrilla Autorizada:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedArtForModal.paso5EquipoEjecutor.integrantes && selectedArtForModal.paso5EquipoEjecutor.integrantes.length > 0 ? (
                          selectedArtForModal.paso5EquipoEjecutor.integrantes.map((int, i) => (
                            <div key={i} style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              background: '#ffffff',
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr',
                              gap: '15px',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 'bold' }}>
                                  {i + 1}. {int.nombre}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
                                  Cargo: {int.cargo}
                                </div>
                                <div style={{
                                  marginTop: '6px',
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  color: int.confirmo_condiciones ? '#166534' : '#991b1b',
                                  backgroundColor: int.confirmo_condiciones ? '#d1fae5' : '#fee2e2',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block'
                                }}>
                                  {int.confirmo_condiciones
                                    ? '✓ Declaración: 100% APTO(A) FÍSICA Y PSICOLÓGICAMENTE'
                                    : '✗ Declaración: NO APTO(A) PARA INGRESO'}
                                </div>
                              </div>

                              <div style={{ textAlign: 'center', borderLeft: '1px dashed #e2e8f0', paddingLeft: '15px' }}>
                                <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>
                                  Firma Electrónica
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
                                  {int.firma && int.firma.startsWith('data:image/') ? (
                                    <img src={int.firma} alt={`Firma de ${int.nombre}`} style={{ maxHeight: '38px', maxWidth: '100%', display: 'block', mixBlendMode: 'multiply' }} />
                                  ) : (
                                    <span className="typewritten-signature" style={{ fontSize: '11px' }}>
                                      {int.firma || '(Sin Firma)'}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '7px', color: '#cbd5e1', marginTop: '2px', fontFamily: 'monospace' }}>
                                  Timestamp: {new Date(selectedArtForModal.createdAt).toLocaleDateString()} {selectedArtForModal.paso1Planificacion.hora_inicio || ''}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '10px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                            No se registraron integrantes adicionales en la cuadrilla. Trabajo individual.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* FLOATING ACTION BAR FOR FOOTER BUTTONS */}
            <div className="print-avoid" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedArtForModal(null)}
                style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600' }}
              >
                Cerrar Expediente
              </button>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '600' }}
              >
                🖨️ Imprimir Copia Física
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'Dashboard' && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Panel de Control HSE</h2>
                    <p>Consola ejecutiva de supervisión de riesgos en faenas del cliente MIES.</p>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={fetchARTs}>
                    🔄 Actualizar Panel
                  </button>
                </div>

                {hasAccess('Formulario') && (
                  <div className="mb-6 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-4" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 100%)', borderRadius: '16px' }}>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', color: '#ffffff' }}>
                        <span>⚡</span> Registrar Nuevo Formulario ART
                      </h3>
                      <p className="text-sm opacity-90" style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#bfdbfe' }}>Inicie la planificación, autoverificación y firmas digitales de análisis de riesgos en terreno de forma inmediata.</p>
                    </div>
                    <button 
                      onClick={() => setCurrentView('Formulario')} 
                      className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer hover:scale-105 transform active:scale-95"
                      style={{ fontSize: '14px', border: 'none', color: '#1e40af', background: '#ffffff', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      📝 Iniciar Formulario ART
                    </button>
                  </div>
                )}

                {/* KPI METRIC CARDS */}
                <div className="kpi-grid">
                  <div className="kpi-card total">
                    <span className="kpi-label">Formularios Ingresados</span>
                    <span className="kpi-value">{totalCount}</span>
                    <span className="kpi-desc">Total acumulado de faenas registradas</span>
                  </div>
                  <div className="kpi-card approved">
                    <span className="kpi-label">Faenas Activas / Aprobadas</span>
                    <span className="kpi-value" style={{ color: 'var(--success-green)' }}>
                      {approvedCount}
                    </span>
                    <span className="kpi-desc">Faenas con 100% de controles críticos implementados</span>
                  </div>
                  <div className="kpi-card rejected">
                    <span className="kpi-label">Faenas Detenidas (Tarjeta Verde)</span>
                    <span className="kpi-value" style={{ color: 'var(--error-red)' }}>
                      {rejectedCount}
                    </span>
                    <span className="kpi-desc">Operaciones suspendidas por controles críticos insatisfechos</span>
                  </div>
                  <div className="kpi-card rate">
                    <span className="kpi-label">Tasa de Suspensión Preventiva</span>
                    <span className="kpi-value" style={{ color: 'var(--warning-amber)' }}>
                      {rateRejected}%
                    </span>
                    <span className="kpi-desc">Frecuencia de detenciones por Tarjeta Verde</span>
                  </div>
                </div>

                {/* RECENT ACTIVITY LOG SECTION */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <span>⏱️</span> Actividad Reciente de Faenas (Últimos ingresos)
                  </h3>

                  <div className="space-y-4">
                    {artList.slice(0, 3).map((art) => (
                      <div
                        key={art.id}
                        className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-500 cursor-pointer transition-all"
                        onClick={() => setSelectedArtForModal(art)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${art.estado === 'APPROVED_WORK_AUTHORIZED' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {art.estado === 'APPROVED_WORK_AUTHORIZED' ? '✓' : '✗'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{art.paso1Planificacion.trabajo_realizar}</div>
                            <div className="text-xs text-slate-500">{art.paso1Planificacion.lugar_especifico} • Supervisor: {art.paso1Planificacion.supervisor_asigna}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{art.codigoSeguimiento}</div>
                          <div className="text-xs text-slate-400">{new Date(art.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                    {artList.length === 0 && (
                      <div className="text-center py-6 text-slate-500">No existen registros recientes en el sistema.</div>
                    )}
                  </div>

                  <button
                    className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-all"
                    onClick={() => setCurrentView('Historial')}
                  >
                    Ver Historial Completo de Formularios →
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: NUEVO FORMULARIO ART WIZARD */}
            {currentView === 'Formulario' && hasAccess('Formulario') && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Ingreso de Formulario ART Wizard</h2>
                    <p>Asistente dinámico para la ingesta y validación de seguridad de la faena.</p>
                  </div>
                </div>

                {wizardStep <= 5 && isAnyGreenCardTriggered() && (
                  <div className="alert-banner error" style={{ marginBottom: '25px' }}>
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <div className="alert-title">¡TARJETA VERDE DETECTADA!</div>
                      <p className="alert-desc">
                        Existen controles mandatorios en "NO". Al enviar, se registrará como <strong>REJECTED_BY_CRITICAL_CONTROL</strong> para auditoría de seguridad.
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-card" style={{ padding: '30px' }}>
                  {/* INDICADOR DE PASOS DENTRO DE LA CARD */}
                  {wizardStep <= 5 && (
                    <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
                      {[1, 2, 3, 4, 5].map((stepIdx) => (
                        <div key={stepIdx} className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${wizardStep === stepIdx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                            {stepIdx}
                          </div>
                          <span className={`text-xs font-bold hidden sm:inline ${wizardStep === stepIdx ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                            {stepIdx === 1 && 'Planificación'}
                            {stepIdx === 2 && 'Controles Críticos'}
                            {stepIdx === 3 && 'Otros Riesgos'}
                            {stepIdx === 4 && 'Simultáneos'}
                            {stepIdx === 5 && 'Firmas'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleWizardSubmit}>
                    {/* PASO 1 */}
                    {wizardStep === 1 && (
                      <div>
                        <div className="step-header">
                          <h2>Paso 1: Planificación de Obra</h2>
                          <p>Ingrese los detalles horaria e información del supervisor que autoriza.</p>
                        </div>
                        <div className="form-grid-3">
                          <div className="form-field">
                            <label>Supervisor que Asigna <span className="required-star">*</span></label>
                            <input type="text" placeholder="Ej. Ricardo Alarcón" value={paso1.supervisor_asigna} onChange={(e) => setPaso1({ ...paso1, supervisor_asigna: e.target.value })} required />
                          </div>
                          <div className="form-field">
                            <label>Empresa ejecutora <span className="required-star">*</span></label>
                            <input type="text" value={paso1.empresa} onChange={(e) => setPaso1({ ...paso1, empresa: e.target.value })} required />
                          </div>
                          <div className="form-field">
                            <label>Gerencia <span className="required-star">*</span></label>
                            <input type="text" placeholder="Ej. Minería Norte" value={paso1.gerencia} onChange={(e) => setPaso1({ ...paso1, gerencia: e.target.value })} required />
                          </div>
                        </div>
                        <div className="form-grid-3">
                          <div className="form-field">
                            <label>Superintendencia / Dirección</label>
                            <input type="text" placeholder="Ej. Operaciones Chancado" value={paso1.superintendencia_direccion} onChange={(e) => setPaso1({ ...paso1, superintendencia_direccion: e.target.value })} />
                          </div>
                          <div className="form-field">
                            <label>Fecha <span className="required-star">*</span></label>
                            <input type="date" value={paso1.fecha} onChange={(e) => setPaso1({ ...paso1, fecha: e.target.value })} required />
                          </div>
                          <div className="form-field">
                            <label>Hora Inicio <span className="required-star">*</span></label>
                            <input type="time" value={paso1.hora_inicio} onChange={(e) => setPaso1({ ...paso1, hora_inicio: e.target.value })} required />
                          </div>
                        </div>
                        <div className="form-grid-2">
                          <div className="form-field">
                            <label>Hora Término <span className="required-star">*</span></label>
                            <input type="time" value={paso1.hora_termino} onChange={(e) => setPaso1({ ...paso1, hora_termino: e.target.value })} required />
                          </div>
                          <div className="form-field">
                            <label>Lugar Faena <span className="required-star">*</span></label>
                            <input type="text" placeholder="Ej. Domo del Stockpile 02" value={paso1.lugar_especifico} onChange={(e) => setPaso1({ ...paso1, lugar_especifico: e.target.value })} required />
                          </div>
                        </div>
                        <div className="form-field" style={{ marginTop: '10px' }}>
                          <label>Detalle de Faena a Realizar <span className="required-star">*</span></label>
                          <textarea rows={3} placeholder="Describa los alcances del trabajo..." value={paso1.trabajo_realizar} onChange={(e) => setPaso1({ ...paso1, trabajo_realizar: e.target.value })} required />
                        </div>
                      </div>
                    )}

                    {/* PASO 2 */}
                    {wizardStep === 2 && (
                      <div>
                        <div className="step-header">
                          <h2>Paso 2: Controles Críticos de Vida (Tarjeta Verde)</h2>
                          <p>Todos los controles críticos mostrados a continuación son mandatorios.</p>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary-color)', marginBottom: '15px' }}>Bloque del Supervisor (Liderazgo HSE)</h3>
                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">1. ¿El trabajo que asignaré cuenta con un estándar, procedimiento y/o instructivo?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.cuenta_con_estandar ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, cuenta_con_estandar: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.cuenta_con_estandar ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, cuenta_con_estandar: false })}>NO</button>
                          </div>
                        </div>
                        {supervisorCheck.cuenta_con_estandar && (
                          <div className="form-field" style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                            <label>Indicar nombre: <span className="required-star">*</span></label>
                            <input type="text" value={supervisorCheck.nombre_estandar} onChange={(e) => setSupervisorCheck({ ...supervisorCheck, nombre_estandar: e.target.value })} required />
                          </div>
                        )}

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">2. ¿El personal que asignaré para realizar el trabajo, cuenta con las capacitaciones, competencias, salud compatible y/o acreditaciones requeridas?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.personal_capacitado ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, personal_capacitado: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.personal_capacitado ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, personal_capacitado: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">3. ¿Durante la planificación del trabajo, me aseguro de solicitar los permisos para ingresar a las áreas, intervenir equipos y/o interactuar con energías?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.permiso_areas ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, permiso_areas: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.permiso_areas ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, permiso_areas: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">4. ¿Verifiqué que el personal cuenta con los elementos requeridos para realizar la segregación y señalización del área de trabajo, según diseño?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.verifico_segregacion ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, verifico_segregacion: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.verifico_segregacion ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, verifico_segregacion: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">5. ¿El personal a mi cargo cuenta con sistema de comunicación de acuerdo al protocolo de emergencia del área?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.sistema_comunicacion ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, sistema_comunicacion: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.sistema_comunicacion ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, sistema_comunicacion: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container" style={{ marginBottom: '25px' }}>
                          <div className="toggle-label-desc"><span className="toggle-title">6. ¿El personal que asignaré para realizar el trabajo, cuenta con los EPP definidos en el procedimiento de trabajo?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${supervisorCheck.cuenta_epp ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, cuenta_epp: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!supervisorCheck.cuenta_epp ? 'active' : ''}`} onClick={() => setSupervisorCheck({ ...supervisorCheck, cuenta_epp: false })}>NO</button>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '15px' }}>Bloque del Trabajador (Auto-cuidado)</h3>
                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">1. ¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.conoce_estandar ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, conoce_estandar: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.conoce_estandar ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, conoce_estandar: false })}>NO</button>
                          </div>
                        </div>
                        {trabajadorCheck.conoce_estandar && (
                          <div className="form-field" style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                            <label>Indicar nombre: <span className="required-star">*</span></label>
                            <input type="text" value={trabajadorCheck.nombre_estandar_trabajador} onChange={(e) => setTrabajadorCheck({ ...trabajadorCheck, nombre_estandar_trabajador: e.target.value })} required />
                          </div>
                        )}

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">2. ¿Cuento con las competencias y salud compatible para ejecutar el trabajo?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.competencias_salud ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, competencias_salud: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.competencias_salud ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, competencias_salud: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">3. ¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.autorizacion_ingreso ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, autorizacion_ingreso: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.autorizacion_ingreso ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, autorizacion_ingreso: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">4. ¿Segregué y señalicé el área de trabajo con los elementos según diseño?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.segrego_senalizo ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, segrego_senalizo: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.segrego_senalizo ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, segrego_senalizo: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">5. ¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, según protocolo del área?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.conoce_telefono_emergencia ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, conoce_telefono_emergencia: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.conoce_telefono_emergencia ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, conoce_telefono_emergencia: false })}>NO</button>
                          </div>
                        </div>

                        <div className="toggle-field-container">
                          <div className="toggle-label-desc"><span className="toggle-title">6. ¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?</span></div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${trabajadorCheck.usa_epp_bueno ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, usa_epp_bueno: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!trabajadorCheck.usa_epp_bueno ? 'active' : ''}`} onClick={() => setTrabajadorCheck({ ...trabajadorCheck, usa_epp_bueno: false })}>NO</button>
                          </div>
                        </div>

                        {/* SECCIÓN RIESGOS CRÍTICOS ESPECÍFICOS DEL TRABAJO */}
                        <div className="riesgos-criticos-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed var(--card-border)' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚠️ Riesgos Críticos Específicos del Trabajo
                          </h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Haga clic en uno o más riesgos identificados (o en "Otro") para agregar grillas de control específicas tanto para el Supervisor como para el Trabajador.
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                            {/* SUBSECCIÓN SUPERVISOR */}
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary-color)', marginBottom: '12px', borderBottom: '2px solid #cbd5e1', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🛡️ Supervisor(a)
                              </h4>
                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                                  Añadir Grilla de Riesgo:
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {PREDEFINED_RISKS.map(r => (
                                    <button
                                      key={r.nombre}
                                      type="button"
                                      onClick={() => handleSelectRisk('supervisor', r.nombre)}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        borderRadius: '20px',
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff',
                                        color: '#334155',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                      }}
                                      className="hover:bg-slate-100 hover:border-blue-800"
                                    >
                                      ➕ {r.nombre}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => handleCustomRiskInit('supervisor')}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      borderRadius: '20px',
                                      border: '1px dashed #64748b',
                                      background: '#ffffff',
                                      color: '#64748b',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    ➕ Otro (Personalizado)
                                  </button>
                                </div>
                              </div>

                              {/* LISTADO ORDENADO DE GRILLAS DEL SUPERVISOR */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {supervisorRiesgosCriticos.map((risk, idx) => (
                                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)' }}>
                                        Riesgo #{idx + 1}: {risk.nombre || 'Personalizado'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRisk('supervisor', idx)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        ❌ Quitar
                                      </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px', marginBottom: '12px' }}>
                                      <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Nombre del Riesgo <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                          type="text"
                                          placeholder="Ej. Incendios"
                                          value={risk.nombre}
                                          onChange={(e) => handleRiskFieldChange('supervisor', idx, 'nombre', e.target.value)}
                                          style={{ height: '38px', padding: '8px 12px', fontSize: '13px' }}
                                          required
                                        />
                                      </div>
                                      <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Cód.</label>
                                        <input
                                          type="text"
                                          placeholder="Vacío"
                                          value={risk.codigo}
                                          onChange={(e) => handleRiskFieldChange('supervisor', idx, 'codigo', e.target.value)}
                                          style={{ height: '38px', padding: '8px 12px', fontSize: '13px', textAlign: 'center' }}
                                        />
                                      </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '12px' }}>
                                        <thead>
                                          <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', width: '50%' }}>Control / N°</th>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', width: '25%' }}>SÍ</th>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', width: '25%' }}>NO</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {risk.filas.map((row, rowIdx) => (
                                            <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                              <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <span style={{ fontWeight: '600', color: '#64748b' }}>N°</span>
                                                  <input
                                                    type="text"
                                                    placeholder="Vacío"
                                                    value={row.numero}
                                                    onChange={(e) => handleRowChange('supervisor', idx, rowIdx, 'numero', e.target.value)}
                                                    style={{
                                                      width: '55px',
                                                      height: '26px',
                                                      padding: '2px',
                                                      textAlign: 'center',
                                                      fontSize: '12px',
                                                      border: '1px solid #cbd5e1',
                                                      borderRadius: '4px',
                                                      background: '#ffffff'
                                                    }}
                                                  />
                                                </div>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer', background: row.cumple ? '#e8f5e9' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('supervisor', idx, rowIdx, 'cumple', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.cumple ? '#2e7d32' : '#94a3b8' }}>
                                                  {row.cumple ? '✓ SI' : 'SI'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer', background: !row.cumple ? '#ffebee' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('supervisor', idx, rowIdx, 'cumple', false)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: !row.cumple ? '#c62828' : '#94a3b8' }}>
                                                  {!row.cumple ? '✗ NO' : 'NO'}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* SUBSECCIÓN TRABAJADOR */}
                            <div style={{ background: '#fcf8ff', padding: '20px', borderRadius: '14px', border: '1px solid #e9d5ff' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '12px', borderBottom: '2px solid #e9d5ff', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                👷 Trabajador(a)
                              </h4>
                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '8px' }}>
                                  Añadir Grilla de Riesgo:
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {PREDEFINED_RISKS.map(r => (
                                    <button
                                      key={r.nombre}
                                      type="button"
                                      onClick={() => handleSelectRisk('trabajador', r.nombre)}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        borderRadius: '20px',
                                        border: '1px solid #e9d5ff',
                                        background: '#ffffff',
                                        color: '#5b21b6',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      ➕ {r.nombre}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => handleCustomRiskInit('trabajador')}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      borderRadius: '20px',
                                      border: '1px dashed #7c3aed',
                                      background: '#ffffff',
                                      color: '#7c3aed',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    ➕ Otro (Personalizado)
                                  </button>
                                </div>
                              </div>

                              {/* LISTADO ORDENADO DE GRILLAS DEL TRABAJADOR */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {trabajadorRiesgosCriticos.map((risk, idx) => (
                                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-purple)' }}>
                                        Riesgo #{idx + 1}: {risk.nombre || 'Personalizado'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRisk('trabajador', idx)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        ❌ Quitar
                                      </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px', marginBottom: '12px' }}>
                                      <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Nombre del Riesgo <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                          type="text"
                                          placeholder="Ej. Incendios"
                                          value={risk.nombre}
                                          onChange={(e) => handleRiskFieldChange('trabajador', idx, 'nombre', e.target.value)}
                                          style={{ height: '38px', padding: '8px 12px', fontSize: '13px' }}
                                          required
                                        />
                                      </div>
                                      <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Cód.</label>
                                        <input
                                          type="text"
                                          placeholder="Vacío"
                                          value={risk.codigo}
                                          onChange={(e) => handleRiskFieldChange('trabajador', idx, 'codigo', e.target.value)}
                                          style={{ height: '38px', padding: '8px 12px', fontSize: '13px', textAlign: 'center' }}
                                        />
                                      </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '12px' }}>
                                        <thead>
                                          <tr style={{ background: '#faf5ff', color: '#5b21b6' }}>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'left', width: '50%' }}>Control / N°</th>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'center', width: '25%' }}>SÍ</th>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'center', width: '25%' }}>NO</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {risk.filas.map((row, rowIdx) => (
                                            <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? '#ffffff' : '#fdfafb' }}>
                                              <td style={{ padding: '6px 8px', border: '1px solid #e9d5ff' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                  <span style={{ fontWeight: '600', color: '#7c3aed' }}>N°</span>
                                                  <input
                                                    type="text"
                                                    placeholder="Vacío"
                                                    value={row.numero}
                                                    onChange={(e) => handleRowChange('trabajador', idx, rowIdx, 'numero', e.target.value)}
                                                    style={{
                                                      width: '55px',
                                                      height: '26px',
                                                      padding: '2px',
                                                      textAlign: 'center',
                                                      fontSize: '12px',
                                                      border: '1px solid #e9d5ff',
                                                      borderRadius: '4px',
                                                      background: '#ffffff'
                                                    }}
                                                  />
                                                </div>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #e9d5ff', textAlign: 'center', cursor: 'pointer', background: row.cumple ? '#e8f5e9' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('trabajador', idx, rowIdx, 'cumple', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.cumple ? '#2e7d32' : '#94a3b8' }}>
                                                  {row.cumple ? '✓ SI' : 'SI'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #e9d5ff', textAlign: 'center', cursor: 'pointer', background: !row.cumple ? '#ffebee' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('trabajador', idx, rowIdx, 'cumple', false)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: !row.cumple ? '#c62828' : '#94a3b8' }}>
                                                  {!row.cumple ? '✗ NO' : 'NO'}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    )}

                    {/* PASO 3 */}
                    {wizardStep === 3 && (
                      <div>
                        <div className="step-header">
                          <h2>Paso 3: Identificación de Riesgos Específicos Localizados</h2>
                          <p>Agregue otros peligros no contemplados en las preguntas transversales.</p>
                        </div>

                        <div className="list-container">
                          {paso3.map((r, index) => (
                            <div key={index} className="list-row">
                              <div className="list-row-inputs">
                                <div className="form-field">
                                  <label>Riesgo Específico</label>
                                  <input type="text" placeholder="Ej. Caída de rocas" value={r.riesgo} onChange={(e) => handleRiesgoChange(index, 'riesgo', e.target.value)} required />
                                </div>
                                <div className="form-field">
                                  <label>Medida Mitigadora / Control</label>
                                  <input type="text" placeholder="Ej. Acuñadura previa e instalación de malla" value={r.medida_control} onChange={(e) => handleRiesgoChange(index, 'medida_control', e.target.value)} required />
                                </div>
                              </div>
                              {paso3.length > 1 && (
                                <button type="button" className="delete-btn" onClick={() => handleRemoveRiesgo(index)}>🗑️</button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button type="button" className="add-btn" onClick={handleAddRiesgo}>➕ Agregar Riesgo</button>
                      </div>
                    )}

                    {/* PASO 4 */}
                    {wizardStep === 4 && (
                      <div>
                        <div className="step-header">
                          <h2>Paso 4: Coordinación Operativa de Faenas Simultáneas</h2>
                          <p>Si existen cuadrillas aledañas o interferencia de maquinaria, es obligatorio coordinarse.</p>
                        </div>
                        <div className="toggle-field-container" style={{ marginBottom: '25px' }}>
                          <div className="toggle-label-desc">
                            <span className="toggle-title">¿Existen faenas simultáneas operando en la zona?</span>
                          </div>
                          <div className="segmented-toggle">
                            <button type="button" className={`segmented-btn yes-btn ${paso4.existen_trabajos_simultaneos ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, existen_trabajos_simultaneos: true })}>SÍ</button>
                            <button type="button" className={`segmented-btn no-btn ${!paso4.existen_trabajos_simultaneos ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, existen_trabajos_simultaneos: false })}>NO</button>
                          </div>
                        </div>

                        {paso4.existen_trabajos_simultaneos && (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div className="form-field" style={{ marginBottom: '20px' }}>
                              <label style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Si su respuesta es SÍ, describa el contexto en simultáneo <span className="required-star">*</span></label>
                              <textarea
                                rows={2}
                                placeholder="Ej. Trabajo en paralelo con grúa horquilla operando a 5 metros..."
                                value={paso4.contexto_simultaneo || ''}
                                onChange={(e) => setPaso4({ ...paso4, contexto_simultaneo: e.target.value })}
                                required
                              />
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--warning-amber)', marginBottom: '15px' }}>⚠️ Controles de Coordinación Mandatorios:</h3>
                            <div className="toggle-field-container">
                              <div className="toggle-label-desc"><span className="toggle-title">1. ¿Se coordinó delimitación con el otro Líder?</span></div>
                              <div className="segmented-toggle">
                                <button type="button" className={`segmented-btn yes-btn ${paso4.coordinacion_lider_cuadrilla ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, coordinacion_lider_cuadrilla: true })}>SÍ</button>
                                <button type="button" className={`segmented-btn no-btn ${!paso4.coordinacion_lider_cuadrilla ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, coordinacion_lider_cuadrilla: false })}>NO</button>
                              </div>
                            </div>

                            <div className="toggle-field-container">
                              <div className="toggle-label-desc"><span className="toggle-title">2. ¿Se realizó verificación cruzada de interferencia?</span></div>
                              <div className="segmented-toggle">
                                <button type="button" className={`segmented-btn yes-btn ${paso4.verificacion_cruzada_controles ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, verificacion_cruzada_controles: true })}>SÍ</button>
                                <button type="button" className={`segmented-btn no-btn ${!paso4.verificacion_cruzada_controles ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, verificacion_cruzada_controles: false })}>NO</button>
                              </div>
                            </div>

                            <div className="toggle-field-container">
                              <div className="toggle-label-desc"><span className="toggle-title">3. ¿Se difundió el plan a todo el personal de terreno?</span></div>
                              <div className="segmented-toggle">
                                <button type="button" className={`segmented-btn yes-btn ${paso4.comunicacion_acciones_control ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, comunicacion_acciones_control: true })}>SÍ</button>
                                <button type="button" className={`segmented-btn no-btn ${!paso4.comunicacion_acciones_control ? 'active' : ''}`} onClick={() => setPaso4({ ...paso4, comunicacion_acciones_control: false })}>NO</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PASO 5 */}
                    {wizardStep === 5 && (
                      <div>
                        <div className="step-header">
                          <h2>Paso 5: Listado de Cuadrilla y Confirmaciones</h2>
                          <p>Ingrese firmas digitales. El 100% de la cuadrilla debe confirmar encontrarse apto.</p>
                        </div>

                        <div className="team-member-row" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Líder de Cuadrilla</h3>
                          <div className="form-grid-2">
                            <div className="form-field">
                              <label>Nombre Completo</label>
                              <input type="text" placeholder="Ej. Ricardo Alarcón" value={lider.nombre} onChange={(e) => setLider({ ...lider, nombre: e.target.value })} required />
                            </div>
                            <div className="form-field">
                              <label>Cargo del Líder</label>
                              <input type="text" value={lider.cargo} onChange={(e) => setLider({ ...lider, cargo: e.target.value })} required />
                            </div>
                          </div>
                          <div className="form-field" style={{ marginTop: '15px' }}>
                            <label>Firma Digital Interactiva (Dibuja con el dedo o mouse) <span className="required-star">*</span></label>
                            <SignaturePad
                              value={lider.firma}
                              onChange={(sig) => setLider({ ...lider, firma: sig })}
                              placeholder="Firme aquí (Líder de Cuadrilla)"
                            />
                          </div>
                          <div className="toggle-field-container" style={{ margin: '15px 0 0 0', padding: '10px' }}>
                            <span className="toggle-title" style={{ fontSize: '12px' }}>¿Confirmo y valido la aptitud del 100% de la cuadrilla?</span>
                            <div className="segmented-toggle" style={{ width: '100px' }}>
                              <button type="button" className={`segmented-btn yes-btn ${lider.verofico_condiciones ? 'active' : ''}`} style={{ padding: '3px 0', fontSize: '11px' }} onClick={() => setLider({ ...lider, verofico_condiciones: true })}>SÍ</button>
                              <button type="button" className={`segmented-btn no-btn ${!lider.verofico_condiciones ? 'active' : ''}`} style={{ padding: '3px 0', fontSize: '11px' }} onClick={() => setLider({ ...lider, verofico_condiciones: false })}>NO</button>
                            </div>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '15px', fontWeight: '700', marginTop: '25px', marginBottom: '10px' }}>Integrantes de la Cuadrilla</h3>
                        <div className="list-container">
                          {integrantes.map((int, index) => (
                            <div key={index} className="team-member-row">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Operario #{index + 1}</span>
                                {integrantes.length > 1 && (
                                  <button type="button" className="delete-btn" style={{ padding: '3px 8px' }} onClick={() => handleRemoveIntegrante(index)}>🗑️ Quitar</button>
                                )}
                              </div>
                              <div className="form-grid-2">
                                <div className="form-field">
                                  <label>Nombre Operario</label>
                                  <input type="text" placeholder="Ej. Héctor Tapia" value={int.nombre} onChange={(e) => handleIntegranteChange(index, 'nombre', e.target.value)} required />
                                </div>
                                <div className="form-field">
                                  <label>Cargo</label>
                                  <input type="text" placeholder="Ej. Mecánico" value={int.cargo} onChange={(e) => handleIntegranteChange(index, 'cargo', e.target.value)} required />
                                </div>
                              </div>
                              <div className="form-field" style={{ marginTop: '15px' }}>
                                <label>Firma Digital Interactiva (Dibuja con el dedo o mouse) <span className="required-star">*</span></label>
                                <SignaturePad
                                  value={int.firma}
                                  onChange={(sig) => handleIntegranteChange(index, 'firma', sig)}
                                  placeholder={`Firma de ${int.nombre || `Operario ${index + 1}`}`}
                                />
                              </div>
                              <div className="toggle-field-container" style={{ margin: '10px 0 0 0', padding: '8px' }}>
                                <span className="toggle-title" style={{ fontSize: '11px' }}>¿Confirmo estar al 100% de mis facultades físicas y psicológicas?</span>
                                <div className="segmented-toggle" style={{ width: '100px' }}>
                                  <button type="button" className={`segmented-btn yes-btn ${int.confirmo_condiciones ? 'active' : ''}`} style={{ padding: '3px 0', fontSize: '11px' }} onClick={() => handleIntegranteChange(index, 'confirmo_condiciones', true)}>SÍ</button>
                                  <button type="button" className={`segmented-btn no-btn ${!int.confirmo_condiciones ? 'active' : ''}`} style={{ padding: '3px 0', fontSize: '11px' }} onClick={() => handleIntegranteChange(index, 'confirmo_condiciones', false)}>NO</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" className="add-btn" onClick={handleAddIntegrante}>➕ Agregar Operario</button>
                      </div>
                    )}

                    {/* RESULTADO (RECIBO) WIZARD */}
                    {wizardStep === 6 && wizardResult && (
                      <div className="success-screen">
                        <div className="success-icon-container" style={{ backgroundColor: wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'var(--success-green)' : 'var(--error-red)' }}>
                          {wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? '✓' : '✗'}
                        </div>
                        <h2 style={{ color: wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'var(--success-green)' : 'var(--error-red)', fontWeight: 800 }}>
                          {wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'Trabajo Autorizado Exitosamente' : 'Faena Bloqueada - Tarjeta Verde'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'El formulario cumple el 100% del estándar.' : 'Controles críticos obligatorios no aplicados.'}
                        </p>

                        <div className="receipt-card">
                          <div className="receipt-row"><span className="receipt-label">Código Seguimiento</span><span className="receipt-val">{wizardResult.codigoSeguimiento}</span></div>
                          <div className="receipt-row"><span className="receipt-label">ID Transacción</span><span className="receipt-val" style={{ fontSize: '12px', fontFamily: 'monospace' }}>{wizardResult.id}</span></div>
                          <div className="receipt-row"><span className="receipt-label">Fecha de Registro</span><span className="receipt-val">{new Date(wizardResult.createdAt).toLocaleString()}</span></div>
                          <div className="receipt-row">
                            <span className="receipt-label">Estado</span>
                            <span className={`receipt-val badge ${wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'approved' : 'rejected'}`}>
                              {wizardResult.estado === 'APPROVED_WORK_AUTHORIZED' ? 'TRABAJO AUTORIZADO' : 'FAENA RECHAZADA'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
                          {hasAccess('Historial') && (
                            <button type="button" className="btn-secondary" onClick={() => setCurrentView('Historial')}>Ver Historial</button>
                          )}
                          <button type="button" className="btn-primary" onClick={handleWizardReset}>Nuevo Ingreso ART</button>
                        </div>
                      </div>
                    )}

                    {/* BOTONES DE FOOTER */}
                    {wizardStep <= 5 && (
                      <div className="wizard-footer">
                        <button type="button" className="btn-secondary" onClick={() => setWizardStep(wizardStep - 1)} disabled={wizardStep === 1}>Anterior</button>
                        {wizardStep < 5 ? (
                          <button type="button" className="btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Siguiente Paso</button>
                        ) : (
                          <button type="submit" className="btn-submit" disabled={wizardLoading}>
                            {wizardLoading ? 'Enviando al Servidor...' : 'Finalizar y Enviar Formulario'}
                          </button>
                        )}
                      </div>
                    )}

                  </form>
                </div>
              </div>
            )}

            {/* VIEW 3: HISTORIAL DE FORMULARIOS COMPLETO */}
            {currentView === 'Historial' && hasAccess('Historial') && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Historial de Formularios ART</h2>
                    <p>Consulte y filtre los registros oficiales de Análisis de Riesgo del Trabajo.</p>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={fetchARTs}>
                    🔄 Sincronizar Historial
                  </button>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="filters-card">
                  <div className="filter-field">
                    <label>Búsqueda Global</label>
                    <input
                      type="text"
                      placeholder="Código, supervisor, lugar..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-field">
                    <label>Estado de Faena</label>
                    <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                      <option value="ALL">Todos los Estados</option>
                      <option value="APPROVED_WORK_AUTHORIZED">Trabajos Autorizados</option>
                      <option value="REJECTED_BY_CRITICAL_CONTROL">Faenas Bloqueadas</option>
                    </select>
                  </div>
                  <div className="filter-field">
                    <label>Supervisor</label>
                    <select value={filterSupervisor} onChange={(e) => setFilterSupervisor(e.target.value)}>
                      <option value="ALL">Todos los Supervisores</option>
                      {supervisoresUnicos.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-field">
                    <label>Rango de Fechas (Desde - Hasta)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} style={{ padding: '8px 10px', fontSize: '12px', flex: 1 }} />
                      <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} style={{ padding: '8px 10px', fontSize: '12px', flex: 1 }} />
                    </div>
                  </div>
                </div>

                {/* TABLA DE REGISTROS */}
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Seguimiento</th>
                        <th>Fecha Ingreso</th>
                        <th>Empresa</th>
                        <th>Supervisor Asigna</th>
                        <th>Lugar de Faena</th>
                        <th>Estado de Seguridad</th>
                        <th>Registro</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredARTs.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                            No se encontraron registros de formularios con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredARTs.map((art) => (
                          <tr
                            key={art.id}
                            className={art.estado === 'REJECTED_BY_CRITICAL_CONTROL' ? 'rejected-bg-light' : ''}
                          >
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{art.codigoSeguimiento}</td>
                            <td>{new Date(art.createdAt).toLocaleDateString()} {new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="font-semibold">{art.paso1Planificacion.empresa}</td>
                            <td>{art.paso1Planificacion.supervisor_asigna}</td>
                            <td>{art.paso1Planificacion.lugar_especifico}</td>
                            <td>
                              <span className={`table-badge ${art.estado === 'APPROVED_WORK_AUTHORIZED' ? 'approved' : 'rejected'}`}>
                                {art.estado === 'APPROVED_WORK_AUTHORIZED' ? 'TRABAJO AUTORIZADO' : 'FAENA RECHAZADA'}
                              </span>
                            </td>
                            <td>
                              <span className={`table-badge ${art.paso1Planificacion.activo !== false ? 'approved' : 'rejected'}`} style={{ border: 'none', background: art.paso1Planificacion.activo !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: art.paso1Planificacion.activo !== false ? 'var(--success-green)' : 'var(--error-red)' }}>
                                {art.paso1Planificacion.activo !== false ? '🟢 ACTIVO' : '🔴 INACTIVO'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  onClick={() => setSelectedArtForModal(art)}
                                  title="Ver ART Completo"
                                >
                                  👁️ Ver ART
                                </button>
                                <button
                                  type="button"
                                  className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  onClick={() => handleToggleActivo(art.id)}
                                  title={art.paso1Planificacion.activo !== false ? 'Marcar como Inactivo' : 'Marcar como Activo'}
                                >
                                  {art.paso1Planificacion.activo !== false ? '🔒 Desactivar' : '🔓 Activar'}
                                </button>
                                <button
                                  type="button"
                                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  onClick={() => art.id.startsWith('seed-') ? handleDeleteSeedART(art.id) : handleDeleteART(art.id)}
                                  title="Eliminar ART de persistencia"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 4: ADMINISTRACIÓN (TABS DE USUARIOS Y PERFILES) */}
            {currentView === 'Administración' && (hasAccess('Usuarios') || hasAccess('Perfiles')) && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Administración y Gobernanza HSE</h2>
                    <p>Consola modular de control de colaboradores corporativos y asignación de permisos sobre pantallas.</p>
                  </div>
                </div>

                {/* TABS SUPERIORES */}
                <div className="admin-tabs">
                  {hasAccess('Usuarios') && (
                    <button
                      className={`admin-tab-btn ${adminActiveTab === 'Usuarios' ? 'active' : ''}`}
                      onClick={() => setAdminActiveTab('Usuarios')}
                    >
                      👥 Gestión de Colaboradores
                    </button>
                  )}
                  {hasAccess('Perfiles') && (
                    <button
                      className={`admin-tab-btn ${adminActiveTab === 'Perfiles' ? 'active' : ''}`}
                      onClick={() => setAdminActiveTab('Perfiles')}
                    >
                      🛡️ Permisos de Pantallas
                    </button>
                  )}
                </div>

                {/* CONTENIDO TAB 1: GESTIÓN DE USUARIOS */}
                {adminActiveTab === 'Usuarios' && hasAccess('Usuarios') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Listado de Usuarios Registrados</h3>
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => handleOpenUserModal(null)}>
                        ➕ Agregar Nuevo Usuario
                      </button>
                    </div>

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Colaborador</th>
                            <th>Nombre de Usuario</th>
                            <th>Email Corporativo</th>
                            <th>Cargo</th>
                            <th>Perfil</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td>
                                <div className="user-row-meta">
                                  <img src={u.foto} alt={u.nombre} className="avatar-circle" />
                                  <span className="user-name-text">{u.nombre}</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.usuario}</td>
                              <td>{u.email}</td>
                              <td>{u.cargo}</td>
                              <td>
                                <span className={`table-badge ${u.perfil === 'Administrador' ? 'approved' : u.perfil === 'Supervisor' ? 'rate' : 'total'}`} style={{ border: 'none', background: u.perfil === 'Administrador' ? 'rgba(16, 185, 129, 0.15)' : u.perfil === 'Supervisor' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: u.perfil === 'Administrador' ? 'var(--success-green)' : u.perfil === 'Supervisor' ? 'var(--warning-amber)' : 'var(--secondary-color)' }}>
                                  {u.perfil}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button className="action-icon-btn" onClick={() => handleOpenUserModal(u)} title="Editar">✏️</button>
                                  <button className="action-icon-btn" onClick={() => handleDeleteUser(u.id)} title="Eliminar" style={{ color: 'var(--error-red)' }}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MODAL WINDOW FOR COLABORADORES */}
                    {showUserModal && (
                      <div className="modal-overlay">
                        <div className="modal-container">
                          <div className="modal-header">
                            <h3>{editModeUser ? 'Editar Colaborador' : 'Agregar Nuevo Colaborador'}</h3>
                            <button className="action-icon-btn" onClick={() => setShowUserModal(false)} style={{ fontSize: '20px' }}>×</button>
                          </div>
                          <div className="modal-body">
                            <div className="form-field">
                              <label>Nombre Completo <span className="required-star">*</span></label>
                              <input type="text" placeholder="Ej. Ricardo Alarcón" value={formUserNombre} onChange={(e) => setFormUserNombre(e.target.value)} required />
                            </div>
                            <div className="form-field">
                              <label>Nombre de Usuario <span className="required-star">*</span></label>
                              <input type="text" placeholder="Ej. ralarcon" value={formUserUsuario} onChange={(e) => setFormUserUsuario(e.target.value)} required />
                            </div>
                            <div className="form-field">
                              <label>Correo Electrónico <span className="required-star">*</span></label>
                              <input type="text" placeholder="ejemplo@mies.cl" value={formUserEmail} onChange={(e) => setFormUserEmail(e.target.value)} required />
                            </div>
                            <div className="form-field">
                              <label>Cargo</label>
                              <input type="text" placeholder="Ej. Supervisor de Terreno" value={formUserCargo} onChange={(e) => setFormUserCargo(e.target.value)} />
                            </div>
                            <div className="form-field">
                              <label>Perfil Asignado <span className="required-star">*</span></label>
                              <select value={formUserPerfil} onChange={(e) => setFormUserPerfil(e.target.value as any)}>
                                <option value="Administrador">Administrador</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Operador">Operador</option>
                              </select>
                            </div>
                            <div className="form-field">
                              <label>Foto de Perfil (Subir imagen)</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                <img src={formUserFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Vista previa" className="avatar-circle" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '2px solid var(--secondary-color)' }} />
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    key={showUserModal ? 'open' : 'closed'}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          if (typeof reader.result === 'string') {
                                            setFormUserFoto(reader.result);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    style={{ display: 'none' }}
                                    id="user-photo-upload"
                                  />
                                  <label htmlFor="user-photo-upload" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                                    📷 Seleccionar Archivo
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowUserModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSaveUser}>Guardar Usuario</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CONTENIDO TAB 2: MATRIZ DE PERMISOS */}
                {adminActiveTab === 'Perfiles' && hasAccess('Perfiles') && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Matriz de Gobernabilidad de Pantallas</h3>
                    </div>

                    <div className="table-wrapper">
                      <table className="permission-matrix">
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '16px 20px' }}>Perfil / Rol Organizacional</th>
                            <th style={{ textAlign: 'center' }}>📊 Panel de Control</th>
                            <th style={{ textAlign: 'center' }}>📝 Nuevo Formulario ART</th>
                            <th style={{ textAlign: 'center' }}>🗂️ Historial completo</th>
                            <th style={{ textAlign: 'center' }}>👥 Administración (Usuarios)</th>
                            <th style={{ textAlign: 'center' }}>🛡️ Permisos (Perfiles)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profilePermissions.map((p) => (
                            <tr key={p.rol}>
                              <td style={{ padding: '20px', fontWeight: 700, fontSize: '15px' }}>{p.rol}</td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Dashboard}
                                    onChange={() => handlePermissionToggle(p.rol, 'Dashboard')}
                                    disabled={p.rol === 'Operador'}
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Formulario}
                                    onChange={() => handlePermissionToggle(p.rol, 'Formulario')}
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Historial}
                                    onChange={() => handlePermissionToggle(p.rol, 'Historial')}
                                    disabled={p.rol === 'Operador'}
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Usuarios}
                                    onChange={() => handlePermissionToggle(p.rol, 'Usuarios')}
                                    disabled={p.rol === 'Supervisor' || p.rol === 'Operador'}
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Perfiles}
                                    onChange={() => handlePermissionToggle(p.rol, 'Perfiles')}
                                    disabled={p.rol === 'Administrador' || p.rol === 'Supervisor' || p.rol === 'Operador'}
                                  />
                                </label>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>


      {showProfileModal && currentUser && (
        <div className="modal-overlay" style={{ padding: '40px 20px' }}>
          <div className="modal-container medium" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Actualizar Mis Datos de Perfil</h3>
                <span className="text-xs text-slate-500">Modifique sus datos personales y profesionales de inicio de sesión.</span>
              </div>
              <button className="action-icon-btn" onClick={() => setShowProfileModal(false)} style={{ fontSize: '24px' }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-field">
                <label>Nombre Completo <span className="required-star">*</span></label>
                <input type="text" value={profileNombre} onChange={(e) => setProfileNombre(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email Corporativo <span className="required-star">*</span></label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Cargo Organizacional</label>
                <input type="text" value={profileCargo} onChange={(e) => setProfileCargo(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Foto de Perfil (Subir imagen)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <img src={profileFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Vista previa" className="avatar-circle" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '2px solid var(--secondary-color)' }} />
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      key={showProfileModal ? 'open' : 'closed'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setProfileFoto(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="profile-photo-upload"
                    />
                    <label htmlFor="profile-photo-upload" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                      📷 Seleccionar Archivo
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveProfile}>Actualizar Perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
