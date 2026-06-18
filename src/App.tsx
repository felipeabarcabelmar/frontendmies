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
  noAplica?: boolean;
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
  estadoFinalizacion?: string;
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
  vehiculosAsociados?: string[];
  password?: string;
  screens?: { [key in keyof ProfilePermissions['screens']]?: boolean };
}

interface ProfilePermissions {
  rol: 'Administrador' | 'Supervisor' | 'Operador';
  screens: {
    Dashboard: boolean;
    Formulario: boolean;
    Historial: boolean;
    Usuarios: boolean;
    Perfiles: boolean;
    RevisionTecnica: boolean;
    ArtPorFinalizar: boolean;
    Mantenedores: boolean;
    Checklist: boolean;
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

const CHECKLIST_ITEMS = {
  generalidades: [
    { n: 1, label: "Bocina", rc: false },
    { n: 2, label: "Alarma retroceso (RC)", rc: true },
    { n: 3, label: "Estado de Frenos (RC)", rc: true },
    { n: 4, label: "Calefacción", rc: false },
    { n: 5, label: "Corta corriente", rc: false },
    { n: 6, label: "Radio Comunicación (RC)", rc: true },
    { n: 7, label: "Espejo lateral", rc: false },
    { n: 8, label: "Escala acceso estanque", rc: false },
    { n: 9, label: "Estado de Neumáticos", rc: false },
    { n: 10, label: "Limpieza exterior", rc: false },
    { n: 11, label: "Estado Estanque (RC)", rc: true },
    { n: 12, label: "Sistema de venteo", rc: false },
    { n: 13, label: "Válvula interlock", rc: false },
    { n: 14, label: "Acumulador de aire (RC)", rc: true },
    { n: 15, label: "Logo autorizado", rc: false },
    { n: 16, label: "Luces altas", rc: false },
    { n: 17, label: "Luces bajas (RC)", rc: true },
    { n: 18, label: "Luces de emergencia", rc: false },
    { n: 19, label: "Luces de viraje", rc: false },
    { n: 20, label: "Luces de freno", rc: false },
    { n: 21, label: "Luz interior cabina", rc: false },
    { n: 22, label: "Marcador del tablero y combustible", rc: false },
    { n: 23, label: "Nivel de agua limpiaparabrisas", rc: false },
    { n: 24, label: "Estado parachoques", rc: false },
    { n: 25, label: "Aseo interior cabina", rc: false },
    { n: 26, label: "Tacógrafo", rc: false },
    { n: 27, label: "Pisaderas", rc: false },
    { n: 28, label: "Limpia parabrisas", rc: false },
    { n: 29, label: "Cinturón de seguridad", rc: false },
    { n: 30, label: "Cable a tierra", rc: false },
    { n: 31, label: "Trabatuercas (RC)", rc: true },
    { n: 32, label: "Neblineros", rc: false },
    { n: 33, label: "Bombas de suministro (pernos, filtraciones)", rc: false },
    { n: 34, label: "Tubo de escape (cinta antiflama)", rc: false }
  ],
  sistemaAutomatizacion: [
    { n: 35, label: "Nozzle Reader pistola (NR)", rc: false },
    { n: 36, label: "Tag de ventas", rc: false },
    { n: 37, label: "Anillo", rc: false },
    { n: 38, label: "Nano Pass Estanque Servicio", rc: false },
    { n: 39, label: "Nano Pass Conector API", rc: false }
  ],
  aspectosMecanicos: [
    { n: 40, label: "Estado de mangueras", rc: false },
    { n: 41, label: "Filtraciones de válvulas", rc: false },
    { n: 42, label: "Nivel de aceite de motor (RC)", rc: true },
    { n: 43, label: "Nivel de agua", rc: false },
    { n: 44, label: "Nivel de líquido de frenos", rc: false },
    { n: 45, label: "Tensión de correas ventilador", rc: false }
  ],
  equipamiento: [
    { n: 46, label: "Baliza", rc: false },
    { n: 47, label: "Botiquín", rc: false },
    { n: 48, label: "Cadenas y Tensores", rc: false },
    { n: 49, label: "Tapa válvula descarga", rc: false },
    { n: 50, label: "Seguro cajón meter (para fijar puertas abiertas)", rc: false },
    { n: 51, label: "Tapas Pistolas de venta", rc: false },
    { n: 52, label: "Codo de descarga", rc: false },
    { n: 53, label: "Cuñas", rc: false },
    { n: 54, label: "Tag consumo propio", rc: false },
    { n: 55, label: "Foco faenero", rc: false },
    { n: 56, label: "Manguera descarga", rc: false },
    { n: 57, label: "Materiales absorbentes", rc: false },
    { n: 58, label: "Pala", rc: false },
    { n: 59, label: "Triángulos reflectantes", rc: false },
    { n: 60, label: "Pértiga", rc: false },
    { n: 61, label: "Conos", rc: false },
    { n: 62, label: "Extintores (2)", rc: false }
  ],
  documentacionPersonal: [
    { n: 63, label: "Psicotécnico riguroso", rc: false },
    { n: 64, label: "Licencia Municipal", rc: false },
    { n: 65, label: "Licencia Interna", rc: false },
    { n: 66, label: "Credencial Interna", rc: false }
  ],
  camionTanque: [
    { n: 67, label: "Procedimientos operativos", rc: false },
    { n: 68, label: "Documentación camión vigente", rc: false },
    { n: 69, label: "Manual de seguridad combustibles líquidos (MSCL)", rc: false },
    { n: 70, label: "Hoja de seguridad del producto", rc: false }
  ]
};

function MultiSelectProcedimientos({
  selectedString,
  onChange,
  mantenedores
}: {
  selectedString: string;
  onChange: (val: string) => void;
  mantenedores: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected list
  const selectedList = selectedString ? selectedString.split(', ').map(s => s.trim()).filter(Boolean) : [];

  // Deduplicate procedures from mantenedores
  const procList = mantenedores
    .filter(m => m.categoria === 'procedimiento')
    .map(m => {
      try {
        return { id: m.id, ...JSON.parse(m.valor) };
      } catch(e) {
        return { id: m.id, nombre: m.valor, url: '' };
      }
    });

  const uniqueProcs: any[] = [];
  const seen = new Set();
  for (const p of procList) {
    if (p.nombre && !seen.has(p.nombre)) {
      seen.add(p.nombre);
      uniqueProcs.push(p);
    }
  }

  const handleToggle = (nombre: string) => {
    let newList;
    if (selectedList.includes(nombre)) {
      newList = selectedList.filter(s => s !== nombre);
    } else {
      newList = [...selectedList, nombre];
    }
    onChange(newList.join(', '));
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Dropdown Header Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: '40px',
          padding: '8px 12px',
          fontSize: '13px',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        {selectedList.length === 0 ? (
          <span style={{ color: '#94a3b8' }}>-- Seleccionar uno o más procedimientos --</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {selectedList.map((nombre, i) => (
              <span
                key={i}
                style={{
                  background: 'var(--primary-color-light, #e0e7ff)',
                  color: 'var(--primary-color, #1e3a8a)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {nombre}
                <span
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(nombre);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              padding: '6px 0'
            }}
          >
            {uniqueProcs.map((p, idx) => {
              const isChecked = selectedList.includes(p.nombre);
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'background 0.2s',
                    userSelect: 'none',
                    color: 'var(--text-main, #334155)'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(p.nombre)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: isChecked ? '700' : '400' }}>{p.nombre}</span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {/* PDF Action Links */}
      {selectedList.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {selectedList.map((nombre, i) => {
            const matched = procList.find(p => p.nombre === nombre);
            let fileUrl = matched?.url || '';
            if (!fileUrl) {
              fileUrl = `/uploads/${encodeURIComponent(nombre)}.pdf`;
            }
            return (
              <a
                key={i}
                href={fileUrl.startsWith('http') || fileUrl.startsWith('/') ? fileUrl : `/uploads/${fileUrl || nombre}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: 'auto', margin: 0 }}
                title={`Ver PDF de ${nombre}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>picture_as_pdf</span>
                {nombre}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChecklistSectionGrid({
  title,
  items,
  stateKey,
  options,
  form,
  setForm
}: {
  title: string;
  items: any[];
  stateKey: string;
  options: string[];
  form: any;
  setForm: (form: any) => void;
}) {
  const updateItem = (itemN: number, estado: string, obs: string) => {
    const updatedSection = {
      ...form[stateKey],
      [itemN]: { estado, obs }
    };
    setForm({
      ...form,
      [stateKey]: updatedSection
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '14px', fontWeight: '800' }}>{title}</h4>
      <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ width: '6%' }}>N°</th>
              <th style={{ width: '44%' }}>Descripción General</th>
              {options.map((opt) => (
                <th key={opt} style={{ textAlign: 'center', width: opt === 'Observación' ? '30%' : '10%' }}>{opt}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const currentVal = form[stateKey][item.n] || { estado: options[0], obs: '' };
              return (
                <tr key={item.n} style={{ background: item.rc && currentVal.estado !== options[0] && currentVal.estado !== 'Cumple' ? '#fee2e2' : 'transparent' }}>
                  <td style={{ fontWeight: 'bold' }}>{item.n}</td>
                  <td style={{ fontWeight: item.rc ? '700' : '400', color: item.rc ? '#b91c1c' : 'inherit' }}>
                    {item.label}
                    {item.rc && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '6px', fontSize: '10px', background: '#fef2f2', padding: '1px 4px', borderRadius: '4px', border: '1px solid #f87171' }}>PUNTO CRÍTICO (RC)</span>}
                  </td>
                  {options.map((opt) => {
                    if (opt === 'Observación') {
                      return (
                        <td key={opt}>
                          <input 
                            type="text" 
                            placeholder="Añadir observación..." 
                            value={currentVal.obs || ''} 
                            onChange={(e) => updateItem(item.n, currentVal.estado, e.target.value)}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                      );
                    }
                    
                    const isSelected = currentVal.estado === opt;
                    let activeBg = 'var(--primary-color, #1e3a8a)';
                    if (opt === 'Malo' || opt === 'No Cumple') activeBg = 'var(--error-red, #ef4444)';
                    if (opt === 'Bueno' || opt === 'Cumple') activeBg = 'var(--success-green, #10b981)';

                    return (
                      <td key={opt} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => updateItem(item.n, opt, currentVal.obs)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid ' + activeBg : '1px solid #cbd5e1',
                            background: isSelected ? activeBg : '#ffffff',
                            color: isSelected ? '#ffffff' : '#64748b',
                            width: '100%',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function App() {
  // --- ESTADOS DE SESIÓN Y LOGIN ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mies_is_logged_in') === 'true';
  });
  const [loginUser, setLoginUser] = useState<string>('');
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
  const [currentView, setCurrentView] = useState<'Dashboard' | 'Formulario' | 'Historial' | 'Administración' | 'RevisionTecnica' | 'ArtPorFinalizar' | 'Mantenedores' | 'Checklist'>('Dashboard');
  const [adminActiveTab, setAdminActiveTab] = useState<'Usuarios' | 'Perfiles'>('Usuarios');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('mies_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mies_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // --- ESTADOS Y EFECTOS PARA PWA (INSTALACIÓN) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // --- VEHICLE CHECKLIST STATES & HANDLERS ---
  const [checklistsList, setChecklistsList] = useState<any[]>([]);
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const [selectedChecklistForView, setSelectedChecklistForView] = useState<any | null>(null);
  const [checklistStep, setChecklistStep] = useState<number>(1);
  const [checklistForm, setChecklistForm] = useState<any>({
    conductor: '',
    patenteCamion: '',
    turno: 'A',
    numeralMeter: '',
    supervisorCargo: '',
    area: '',
    horometro: '',
    kilometraje: '',
    vencimientoRT: '',
    vencimientoGases: '',
    horaSanitizacion: '',
    generalidades: {},
    sistemaAutomatizacion: {},
    aspectosMecanicos: {},
    equipamiento: {},
    documentacionPersonal: {},
    camionTanque: {},
    observaciones: '',
    firmaConductor: '',
    firmaSupervisor: ''
  });

  const fetchChecklists = async (vehiculoId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${vehiculoId}/checklists`);
      if (res.ok) {
        const data = await res.json();
        setChecklistsList(data || []);
        setDbError(null);
        return;
      } else {
        setDbError('Error al cargar los checklists del vehículo desde la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('No se pudo conectar con la base de datos remota para cargar los checklists.');
    }
    setChecklistsList([]);
  };

  const openNewChecklistModal = (vehiculo: any) => {
    const initGen: any = {};
    CHECKLIST_ITEMS.generalidades.forEach(item => {
      initGen[item.n] = { estado: 'Bueno', obs: '' };
    });
    const initAut: any = {};
    CHECKLIST_ITEMS.sistemaAutomatizacion.forEach(item => {
      initAut[item.n] = { estado: 'Bueno', obs: '' };
    });
    const initMec: any = {};
    CHECKLIST_ITEMS.aspectosMecanicos.forEach(item => {
      initMec[item.n] = { estado: 'Bueno', obs: '' };
    });
    const initEq: any = {};
    CHECKLIST_ITEMS.equipamiento.forEach(item => {
      initEq[item.n] = { estado: 'Bueno', obs: '' };
    });
    const initDoc: any = {};
    CHECKLIST_ITEMS.documentacionPersonal.forEach(item => {
      initDoc[item.n] = { estado: 'Cumple', obs: '' };
    });
    const initTanque: any = {};
    CHECKLIST_ITEMS.camionTanque.forEach(item => {
      initTanque[item.n] = { estado: 'Cumple', obs: '' };
    });

    setChecklistForm({
      conductor: currentUser?.nombre || '',
      patenteCamion: vehiculo.patente,
      turno: 'A',
      numeralMeter: '',
      supervisorCargo: '',
      area: vehiculo.faena || '',
      horometro: '',
      kilometraje: '',
      vencimientoRT: vehiculo.fechaVencimientoRT ? new Date(vehiculo.fechaVencimientoRT).toISOString().split('T')[0] : '',
      vencimientoGases: '',
      horaSanitizacion: '',
      generalidades: initGen,
      sistemaAutomatizacion: initAut,
      aspectosMecanicos: initMec,
      equipamiento: initEq,
      documentacionPersonal: initDoc,
      camionTanque: initTanque,
      observaciones: '',
      firmaConductor: '',
      firmaSupervisor: ''
    });
    setChecklistStep(1);
    setShowChecklistModal(true);
  };

  const checkCriticalControlFailure = () => {
    const genFail = CHECKLIST_ITEMS.generalidades.some(item => 
      item.rc && checklistForm.generalidades[item.n]?.estado === 'Malo'
    );
    const mecFail = CHECKLIST_ITEMS.aspectosMecanicos.some(item => 
      item.rc && checklistForm.aspectosMecanicos[item.n]?.estado === 'Malo'
    );
    return genFail || mecFail;
  };

  const handleSaveChecklist = async () => {
    if (!selectedVehiculo) return;
    try {
      const isRcFailure = checkCriticalControlFailure();
      const payload = {
        ...checklistForm,
        generalidades: JSON.stringify(checklistForm.generalidades),
        sistemaAutomatizacion: JSON.stringify(checklistForm.sistemaAutomatizacion),
        aspectosMecanicos: JSON.stringify(checklistForm.aspectosMecanicos),
        equipamiento: JSON.stringify(checklistForm.equipamiento),
        documentacionPersonal: JSON.stringify(checklistForm.documentacionPersonal),
        camionTanque: JSON.stringify(checklistForm.camionTanque),
        estadoCumplimiento: isRcFailure ? 'RECHAZADO' : 'APROBADO'
      };

      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${selectedVehiculo.id}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowChecklistModal(false);
        fetchChecklists(selectedVehiculo.id);
        fetchAllChecklists();
        setDbError(null);
        alert(isRcFailure 
          ? 'Checklist guardado con éxito. ATENCIÓN: El vehículo queda RECHAZADO por fallar controles críticos (RC).' 
          : 'Checklist guardado y aprobado con éxito.'
        );
      } else {
        setDbError('No se pudo guardar el checklist en el servidor.');
      }
    } catch (err) {
      console.error(err);
      setDbError('Error al conectar con el servidor para guardar el checklist.');
    }
  };

  const [allChecklistsList, setAllChecklistsList] = useState<any[]>([]);
  const [filterChecklistSearch, setFilterChecklistSearch] = useState<string>('');
  const [filterChecklistEstado, setFilterChecklistEstado] = useState<string>('ALL');

  const fetchAllChecklists = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/checklists`);
      if (res.ok) {
        const data = await res.json();
        setAllChecklistsList(data || []);
      }
    } catch (err) {
      console.error('Error fetching all checklists:', err);
    }
  };

  useEffect(() => {
    fetchAllChecklists();
  }, []);

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
      screens: { Dashboard: true, Formulario: true, Historial: true, Usuarios: true, Perfiles: true, RevisionTecnica: true, ArtPorFinalizar: true, Mantenedores: true, Checklist: true }
    },
    {
      rol: 'Supervisor',
      screens: { Dashboard: true, Formulario: true, Historial: true, Usuarios: false, Perfiles: false, RevisionTecnica: true, ArtPorFinalizar: true, Mantenedores: true, Checklist: true }
    },
    {
      rol: 'Operador',
      screens: { Dashboard: false, Formulario: true, Historial: true, Usuarios: false, Perfiles: false, RevisionTecnica: false, ArtPorFinalizar: false, Mantenedores: false, Checklist: true }
    }
  ]);

  // --- BASE DE DATOS DE COLABORADORES ---
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
            estadoFinalizacion: r.estadoFinalizacion || 'EN_PROCESO',
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
      fetchVehiculos();
      fetchMantenedores();
      fetchUsers();
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

    const foundUser = users.find(u => u.email.toLowerCase().trim() === loginUser.toLowerCase().trim());

    if (foundUser && loginPassword === (foundUser.password || 'admin123')) {
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
      setAuthError('Credenciales incorrectas. Verifique el correo electrónico o la contraseña.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginPassword('');
    setSelectedArtForModal(null);
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
    if (currentUser.perfil === 'Administrador') return true;
    if (currentUser.screens && currentUser.screens[screen] !== undefined) {
      return currentUser.screens[screen];
    }
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
  const [profilePassword, setProfilePassword] = useState<string>('');
  const [formUserUsuario, setFormUserUsuario] = useState<string>('');
  const [formUserCargo, setFormUserCargo] = useState<string>('');
  const [formUserEmail, setFormUserEmail] = useState<string>('');
  const [formUserPerfil, setFormUserPerfil] = useState<'Administrador' | 'Supervisor' | 'Operador'>('Operador');
  const [formUserFoto, setFormUserFoto] = useState<string>('');
  const [formUserVehiculos, setFormUserVehiculos] = useState<string[]>([]);
  const [formUserPassword, setFormUserPassword] = useState<string>('');
  const [formUserScreens, setFormUserScreens] = useState<{ [key in keyof ProfilePermissions['screens']]?: boolean }>({});

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
      setFormUserVehiculos(user.vehiculosAsociados || []);
      setFormUserPassword(user.password || 'admin123');
      const defaultScreens = profilePermissions.find(p => p.rol === user.perfil)?.screens || {};
      setFormUserScreens(user.screens || { ...defaultScreens });
    } else {
      setEditModeUser(null);
      setFormUserNombre('');
      setFormUserUsuario('');
      setFormUserCargo('');
      setFormUserEmail('');
      setFormUserPerfil('Operador');
      setFormUserFoto(randomAvatars[Math.floor(Math.random() * randomAvatars.length)]);
      setFormUserVehiculos([]);
      setFormUserPassword('admin123');
      const defaultScreens = profilePermissions.find(p => p.rol === 'Operador')?.screens || {};
      setFormUserScreens({ ...defaultScreens });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!formUserNombre || !formUserUsuario || !formUserEmail) return;

    try {
      if (editModeUser) {
        const payload = {
          nombre: formUserNombre,
          usuario: formUserUsuario,
          cargo: formUserCargo,
          email: formUserEmail,
          perfil: formUserPerfil,
          foto: formUserFoto,
          vehiculosAsociados: formUserVehiculos,
          password: formUserPassword,
          screens: formUserScreens
        };

        const res = await fetch(`${API_BASE_URL}/users/${editModeUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          setUsers(users.map(u => u.id === editModeUser.id ? updated : u));
          if (currentUser && currentUser.id === editModeUser.id) {
            setCurrentUser(updated);
          }
          setShowUserModal(false);
        } else {
          const errData = await res.json();
          alert(errData.mensaje || 'Error al actualizar colaborador.');
        }
      } else {
        const payload = {
          nombre: formUserNombre,
          usuario: formUserUsuario,
          cargo: formUserCargo,
          email: formUserEmail,
          perfil: formUserPerfil,
          foto: formUserFoto,
          vehiculosAsociados: formUserVehiculos,
          password: formUserPassword,
          screens: formUserScreens
        };

        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const newUser = await res.json();
          setUsers([...users, newUser]);
          setShowUserModal(false);
        } else {
          const errData = await res.json();
          alert(errData.mensaje || 'Error al crear colaborador.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al guardar el colaborador.');
    }
  };

  const handleOpenProfileModal = () => {
    if (currentUser) {
      setProfileNombre(currentUser.nombre);
      setProfileCargo(currentUser.cargo || '');
      setProfileEmail(currentUser.email);
      setProfileFoto(currentUser.foto);
      setProfilePassword(currentUser.password || 'admin123');
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profileNombre || !profileEmail) return;

    try {
      const payload = {
        nombre: profileNombre,
        cargo: profileCargo,
        email: profileEmail,
        foto: profileFoto,
        password: profilePassword
      };

      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setUsers(users.map(u => u.id === currentUser.id ? updated : u));
        setShowProfileModal(false);
      } else {
        const errData = await res.json();
        alert(errData.mensaje || 'Error al actualizar perfil.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al actualizar tu perfil.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Operación denegada: No es posible auto-eliminarse de la sesión activa.');
      return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar este colaborador de forma permanente?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.mensaje || 'Error al eliminar colaborador.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al eliminar colaborador.');
    }
  };

  // --- WIZARD FORM WIDGET IMPLEMENTATION ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardLoading, setWizardLoading] = useState<boolean>(false);
  const [wizardResult, setWizardResult] = useState<any | null>(null);

  const [paso1, setPaso1] = useState<Paso1Planificacion>({
    supervisor_asigna: '',
    empresa: 'Mies - Copec',
    gerencia: 'Gser',
    superintendencia_direccion: 'logística',
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
      filas.push({ numero: '', cumple: true, noAplica: false }); // preset to empty string as per request, with cumple preset to true (SI)
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

  const handleRowChange = (type: 'supervisor' | 'trabajador', riskIndex: number, rowIndex: number, field: 'numero' | 'cumple' | 'noAplica', value: any) => {
    if (type === 'supervisor') {
      const updated = supervisorRiesgosCriticos.map((risk, i) => {
        if (i === riskIndex) {
          const updatedFilas = risk.filas.map((row, j) => {
            if (j === rowIndex) {
              if (field === 'cumple') {
                return { ...row, cumple: value, noAplica: value ? false : row.noAplica };
              }
              if (field === 'noAplica') {
                return { ...row, noAplica: value, cumple: value ? false : row.cumple };
              }
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
              if (field === 'cumple') {
                return { ...row, cumple: value, noAplica: value ? false : row.noAplica };
              }
              if (field === 'noAplica') {
                return { ...row, noAplica: value, cumple: value ? false : row.cumple };
              }
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

  // ==========================================
  // --- ESTADOS Y MODELOS: REVISIÓN TÉCNICA ---
  // ==========================================
  
  interface VehiculoEquipo {
    id: string;
    tipo: string; // 'camion' | 'camioneta' | 'equipo'
    patente: string;
    faena: string;
    contratista: string;
    fotoUrl: string | null;
    fechaRT: string | null;
    fechaVencimientoRT: string | null;
    numCertificado: string | null;
    fechaEmisionCertificado: string | null;
    fechaVencimientoCertificado: string | null;
    fechaVencimientoPermisoCirc: string | null;
    minaFechaControl: string | null;
    minaFechaVencimiento: string | null;
    diasParaRT?: number | null;
    diasParaCertificado?: number | null;
    diasParaPermisoCirc?: number | null;
    diasParaMinaControl?: number | null;
    estadoRT: 'vigente' | 'cordinar envió' | 'vencido';
    estadoMina: 'vigente' | 'cordinar envió' | 'vencido';
  }

  interface RegistroKilometraje {
    id: string;
    vehiculoId: string;
    fecha: string;
    kilometraje: number;
  }

  interface Mantenedor {
    id: string;
    categoria: string;
    valor: string;
  }
  // --- RECT STATES ---
  const [dbError, setDbError] = useState<string | null>(null);
  const [vehiculos, setVehiculos] = useState<VehiculoEquipo[]>([]);
  const [mantenedores, setMantenedores] = useState<Mantenedor[]>([]);

  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoEquipo | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'grid'>('cards');
  const [selectedTipoTab, setSelectedTipoTab] = useState<'camion' | 'camioneta' | 'equipo'>('camion');

  // Filtros
  const [filterVehiculoSearch, setFilterVehiculoSearch] = useState<string>('');
  const [filterVehiculoEstado, setFilterVehiculoEstado] = useState<string>('ALL');
  const [filterVehiculoFaena, setFilterVehiculoFaena] = useState<string>('ALL');
  const [filterVehiculoContratista, setFilterVehiculoContratista] = useState<string>('ALL');

  // Modales
  const [showVehiculoModal, setShowVehiculoModal] = useState<boolean>(false);
  const [editModeVehiculo, setEditModeVehiculo] = useState<VehiculoEquipo | null>(null);
  const [showMantenedoresModal, setShowMantenedoresModal] = useState<boolean>(false);

  // Kilometraje
  const [kilometrajesList, setKilometrajesList] = useState<RegistroKilometraje[]>([]);
  const [currentKilometrajeDate, setCurrentKilometrajeDate] = useState<string>('');
  const [currentKilometrajeVal, setCurrentKilometrajeVal] = useState<number>(0);
  const [showKilometrajeInputModal, setShowKilometrajeInputModal] = useState<boolean>(false);
  const [mileageMonthOffset, setMileageMonthOffset] = useState<number>(0);

  // Formulario vehículo
  const [formVehTipo, setFormVehTipo] = useState<string>('camion');
  const [formVehPatente, setFormVehPatente] = useState<string>('');
  const [formVehFaena, setFormVehFaena] = useState<string>('');
  const [formVehContratista, setFormVehContratista] = useState<string>('');
  const [formVehFotoUrl, setFormVehFotoUrl] = useState<string>('');
  const [formVehFechaRT, setFormVehFechaRT] = useState<string>('');
  const [formVehFechaVencimientoRT, setFormVehFechaVencimientoRT] = useState<string>('');
  const [formVehNumCertificado, setFormVehNumCertificado] = useState<string>('');
  const [formVehFechaEmisionCert, setFormVehFechaEmisionCert] = useState<string>('');
  const [formVehFechaVencimientoCert, setFormVehFechaVencimientoCert] = useState<string>('');
  const [formVehFechaVencimientoPermisoCirc, setFormVehFechaVencimientoPermisoCirc] = useState<string>('');
  const [formVehMinaFechaControl, setFormVehMinaFechaControl] = useState<string>('');
  const [formVehMinaFechaVencimiento, setFormVehMinaFechaVencimiento] = useState<string>('');

  // Formulario mantenedores
  const [formMantCategoria, setFormMantCategoria] = useState<string>('faena');
  const [formMantValor, setFormMantValor] = useState<string>('');

  // Estados para pantalla unificada de Mantenedores
  const [mantActiveTab, setMantActiveTab] = useState<'supervisor' | 'trabajo' | 'lugar_faena' | 'procedimiento' | 'riesgo_localizado' | 'faena_contras'>('supervisor');
  const [formSupervisorVal, setFormSupervisorVal] = useState<string>('');
  const [formTrabajoVal, setFormTrabajoVal] = useState<string>('');
  const [formLugarVal, setFormLugarVal] = useState<string>('');
  const [formProcNombre, setFormProcNombre] = useState<string>('');
  const [formProcFileBase64, setFormProcFileBase64] = useState<string>('');
  const [formProcFileName, setFormProcFileName] = useState<string>('');
  const [formRiesgoVal, setFormRiesgoVal] = useState<string>('');
  const [formMedidaVal, setFormMedidaVal] = useState<string>('');
  const [formFaenaContraVal, setFormFaenaContraVal] = useState<string>('');
  const [formFaenaContraCat, setFormFaenaContraCat] = useState<'faena' | 'contratista'>('faena');
  const [procUploadLoading, setProcUploadLoading] = useState<boolean>(false);



  // --- CAPA DE SERVICIO API VEHÍCULOS ---

  const fetchVehiculos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos`);
      if (res.ok) {
        const data = await res.json();
        setVehiculos(data || []);
        setDbError(null);
      } else {
        setDbError('Error al cargar la lista de vehículos desde la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('No se pudo conectar con la base de datos remota para cargar los vehículos.');
    }
  };

  const fetchMantenedores = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores`);
      if (res.ok) {
        const data = await res.json();
        setMantenedores(data || []);
        setDbError(null);
      } else {
        setDbError('Error al cargar los mantenedores desde la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('No se pudo conectar con la base de datos remota para cargar los mantenedores.');
    }
  };

  const fetchKilometrajes = async (vehiculoId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${vehiculoId}/kilometraje`);
      if (res.ok) {
        const data = await res.json();
        setKilometrajesList(data || []);
        setDbError(null);
        return;
      } else {
        setDbError('Error al cargar el kilometraje del vehículo desde la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('No se pudo conectar con la base de datos remota para cargar el kilometraje.');
    }
    setKilometrajesList([]);
  };

  const handleSaveVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVehPatente || !formVehFaena || !formVehContratista) return;

    const payload = {
      tipo: formVehTipo,
      patente: formVehPatente,
      faena: formVehFaena,
      contratista: formVehContratista,
      fotoUrl: formVehFotoUrl || null,
      fechaRT: formVehFechaRT || null,
      fechaVencimientoRT: formVehFechaVencimientoRT || null,
      numCertificado: formVehNumCertificado || null,
      fechaEmisionCertificado: formVehFechaEmisionCert || null,
      fechaVencimientoCertificado: formVehFechaVencimientoCert || null,
      fechaVencimientoPermisoCirc: formVehFechaVencimientoPermisoCirc || null,
      minaFechaControl: formVehMinaFechaControl || null,
      minaFechaVencimiento: formVehMinaFechaVencimiento || null
    };

    try {
      let res;
      if (editModeVehiculo) {
        res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${editModeVehiculo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/vehiculos-equipos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        await fetchVehiculos();
        setShowVehiculoModal(false);
        setEditModeVehiculo(null);
        setDbError(null);
        return;
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDbError(errorData.mensaje || 'Error al guardar el vehículo/equipo en la base de datos.');
      }
    } catch (err) {
      console.error('Error al guardar en el servidor:', err);
      setDbError('Error de red: No se pudo conectar al servidor para guardar el vehículo/equipo.');
    }
  };

  const handleDeleteVehiculo = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de vehículo/equipo?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchVehiculos();
        setSelectedVehiculo(null);
        setDbError(null);
        return;
      } else {
        setDbError('Error al eliminar el vehículo/equipo de la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('Error de red: No se pudo conectar al servidor para eliminar el vehículo/equipo.');
    }
  };

  const handleSaveKilometraje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehiculo || !currentKilometrajeDate || currentKilometrajeVal < 0) return;

    const payload = {
      fecha: currentKilometrajeDate,
      kilometraje: Number(currentKilometrajeVal)
    };

    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos-equipos/${selectedVehiculo.id}/kilometraje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchKilometrajes(selectedVehiculo.id);
        setShowKilometrajeInputModal(false);
        setDbError(null);
        return;
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDbError(errorData.mensaje || 'Error al registrar el kilometraje en la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('Error de red: No se pudo conectar al servidor para registrar el kilometraje.');
    }
  };

  const handleSaveMantenedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMantValor) return;

    const payload = {
      categoria: formMantCategoria,
      valor: formMantValor
    };

    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchMantenedores();
        setFormMantValor('');
        setDbError(null);
        return;
      } else {
        setDbError('Error al registrar el mantenedor en la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('Error de red: No se pudo conectar al servidor para registrar el mantenedor.');
    }
  };

  const handleDeleteMantenedor = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchMantenedores();
        setDbError(null);
        return;
      } else {
        setDbError('Error al eliminar el mantenedor de la base de datos.');
      }
    } catch (err) {
      console.error(err);
      setDbError('Error de red: No se pudo conectar al servidor para eliminar el mantenedor.');
    }
  };

  // Handler para agregar mantenedor de tipo simple (Supervisor, Trabajo, Lugar)
  const handleAddSimpleMantenedor = async (categoria: string, valor: string, clearCallback: () => void) => {
    if (!valor.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria, valor: valor.trim() })
      });
      if (res.ok) {
        await fetchMantenedores();
        clearCallback();
        setDbError(null);
      } else {
        alert('Error al registrar el elemento en la base de datos.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red: No se pudo conectar al servidor.');
    }
  };

  // Handler para agregar riesgos localizados predefinidos
  const handleAddPredefinedRiskMantenedor = async (riesgo: string, medida: string) => {
    if (!riesgo.trim() || !medida.trim()) return;
    const valor = JSON.stringify({ riesgo: riesgo.trim(), medida_control: medida.trim() });
    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: 'riesgo_localizado', valor })
      });
      if (res.ok) {
        await fetchMantenedores();
        setFormRiesgoVal('');
        setFormMedidaVal('');
        setDbError(null);
      } else {
        alert('Error al registrar el riesgo en la base de datos.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red: No se pudo conectar al servidor.');
    }
  };

  // Handler para subir PDF y agregar procedimiento
  const handleAddProcedureMantenedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProcNombre.trim()) {
      alert('Por favor ingrese el nombre del procedimiento.');
      return;
    }

    let url = '';
    if (formProcFileBase64 && formProcFileName) {
      setProcUploadLoading(true);
      try {
        const uploadRes = await fetch(`${API_BASE_URL}/procedimientos/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: formProcFileName,
            fileData: formProcFileBase64
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          url = uploadData.url || `/uploads/${formProcFileName}`;
        } else {
          alert('Error al subir el archivo PDF al servidor. Se guardará sin archivo adjunto.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir el PDF. Se guardará sin archivo adjunto.');
      } finally {
        setProcUploadLoading(false);
      }
    }

    const valor = JSON.stringify({ nombre: formProcNombre.trim(), url });
    try {
      const res = await fetch(`${API_BASE_URL}/mantenedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: 'procedimiento', valor })
      });
      if (res.ok) {
        await fetchMantenedores();
        setFormProcNombre('');
        setFormProcFileBase64('');
        setFormProcFileName('');
        setDbError(null);
        alert('Procedimiento registrado exitosamente.');
      } else {
        alert('Error al registrar el procedimiento en la base de datos.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al registrar el procedimiento.');
    }
  };

  const openCreateVehiculoModal = () => {
    setEditModeVehiculo(null);
    setFormVehTipo('camion');
    setFormVehPatente('');
    
    // Asignar primer valor del mantenedor si existe
    const faenas = mantenedores.filter(m => m.categoria === 'faena');
    setFormVehFaena(faenas.length > 0 ? faenas[0].valor : 'Codelco Andina');
    
    const contras = mantenedores.filter(m => m.categoria === 'contratista');
    setFormVehContratista(contras.length > 0 ? contras[0].valor : 'MIES');
    
    setFormVehFotoUrl('');
    setFormVehFechaRT('');
    setFormVehFechaVencimientoRT('');
    setFormVehNumCertificado('');
    setFormVehFechaEmisionCert('');
    setFormVehFechaVencimientoCert('');
    setFormVehFechaVencimientoPermisoCirc('');
    setFormVehMinaFechaControl('');
    setFormVehMinaFechaVencimiento('');
    setShowVehiculoModal(true);
  };

  const openEditVehiculoModal = (v: VehiculoEquipo) => {
    setEditModeVehiculo(v);
    setFormVehTipo(v.tipo);
    setFormVehPatente(v.patente);
    setFormVehFaena(v.faena);
    setFormVehContratista(v.contratista);
    setFormVehFotoUrl(v.fotoUrl || '');
    setFormVehFechaRT(v.fechaRT || '');
    setFormVehFechaVencimientoRT(v.fechaVencimientoRT || '');
    setFormVehNumCertificado(v.numCertificado || '');
    setFormVehFechaEmisionCert(v.fechaEmisionCertificado || '');
    setFormVehFechaVencimientoCert(v.fechaVencimientoCertificado || '');
    setFormVehFechaVencimientoPermisoCirc(v.fechaVencimientoPermisoCirc || '');
    setFormVehMinaFechaControl(v.minaFechaControl || '');
    setFormVehMinaFechaVencimiento(v.minaFechaVencimiento || '');
    setShowVehiculoModal(true);
  };

  const getCalendarDays = () => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + mileageMonthOffset);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const prevLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    for (let i = firstDayIndex; i > 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dayStr = String(prevLastDay - i + 1).padStart(2, '0');
      const monthStr = String(prevMonth + 1).padStart(2, '0');
      days.push({
        dateStr: `${prevYear}-${monthStr}-${dayStr}`,
        dayNum: prevLastDay - i + 1,
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= lastDay; i++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      days.push({
        dateStr: `${year}-${monthStr}-${dayStr}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }
    
    const totalCells = 42;
    const nextMonthPadding = totalCells - days.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dayStr = String(i).padStart(2, '0');
      const monthStr = String(nextMonth + 1).padStart(2, '0');
      days.push({
        dateStr: `${nextYear}-${monthStr}-${dayStr}`,
        dayNum: i,
        isCurrentMonth: false
      });
    }
    
    return { days, year, month };
  };

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

  const handleAddPredefinedRiesgo = (riesgo: string, medida: string) => {
    if (paso3.length === 1 && !paso3[0].riesgo && !paso3[0].medida_control) {
      setPaso3([{ riesgo, medida_control: medida }]);
    } else {
      setPaso3([...paso3, { riesgo, medida_control: medida }]);
    }
  };

  const handleFinalizarART = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/formularios-art/${id}/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        alert('ART Finalizada exitosamente.');
        await fetchARTs();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al finalizar ART: ${errData.mensaje || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al intentar finalizar la ART.');
    }
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
      empresa: 'Mies - Copec',
      gerencia: 'Gser',
      superintendencia_direccion: 'logística',
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

  // --- MÉTRICAS DE FLOTA VEHÍCULOS / EQUIPOS ---
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const vehiculosConRTVencida = vehiculos.filter(v => 
    v.tipo !== 'equipo' && 
    v.fechaVencimientoRT && 
    new Date(v.fechaVencimientoRT) < todayDate
  );

  const equiposConCertVencido = vehiculos.filter(v => 
    v.tipo === 'equipo' && 
    v.fechaVencimientoCertificado && 
    new Date(v.fechaVencimientoCertificado) < todayDate
  );

  const vehiculosConPCVencido = vehiculos.filter(v => 
    v.fechaVencimientoPermisoCirc && 
    new Date(v.fechaVencimientoPermisoCirc) < todayDate
  );

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
              <label>Correo Electrónico Corporativo</label>
              <input
                type="email"
                placeholder="ejemplo@mies.cl"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
                className="w-full text-slate-800"
              />
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
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <>
              <img src="https://www.mies.cl/img/logo.svg" alt="MIES" className="sidebar-logo" />
              <span className="sidebar-logo-text">MIES HSE</span>
            </>
          )}
          {isSidebarCollapsed && (
            <img src="https://www.mies.cl/img/logo.svg" alt="MIES" className="sidebar-logo collapsed" />
          )}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <span className="material-symbols-outlined">
              {isSidebarCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
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
                onClick={() => {
                  setCurrentView('Dashboard');
                  setSelectedArtForModal(null);
                }}
              >
                <span className="material-symbols-outlined menu-item-icon">dashboard</span>
                <span className="menu-item-text">Panel de Control</span>
              </button>
            </li>
          )}

          {/* GRUPO ART */}
          {(hasAccess('Formulario') || hasAccess('ArtPorFinalizar') || hasAccess('Historial')) && (
            <>
              <li className="sidebar-section-header">
                {!isSidebarCollapsed ? 'Gestión ART' : <div style={{ height: '1px', background: 'var(--card-border, #e2e8f0)', margin: '8px 12px' }} />}
              </li>
              
              {hasAccess('Formulario') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'Formulario' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('Formulario');
                      handleWizardReset();
                      setSelectedArtForModal(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">edit_document</span>
                    <span className="menu-item-text">Nuevo Formulario</span>
                  </button>
                </li>
              )}

              {hasAccess('ArtPorFinalizar') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'ArtPorFinalizar' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('ArtPorFinalizar');
                      setSelectedArtForModal(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">pending_actions</span>
                    <span className="menu-item-text">ART por Finalizar</span>
                  </button>
                </li>
              )}

              {hasAccess('Historial') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'Historial' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('Historial');
                      setSelectedArtForModal(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">inventory_2</span>
                    <span className="menu-item-text">Historial ART</span>
                  </button>
                </li>
              )}
            </>
          )}

          {/* GRUPO VEHÍCULOS */}
          {(hasAccess('RevisionTecnica') || hasAccess('Checklist')) && (
            <>
              <li className="sidebar-section-header">
                {!isSidebarCollapsed ? 'Gestión de Vehículos' : <div style={{ height: '1px', background: 'var(--card-border, #e2e8f0)', margin: '8px 12px' }} />}
              </li>

              {hasAccess('RevisionTecnica') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'RevisionTecnica' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('RevisionTecnica');
                      setSelectedArtForModal(null);
                      setSelectedVehiculo(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">local_shipping</span>
                    <span className="menu-item-text">Gestionar Vehículos</span>
                  </button>
                </li>
              )}

              {hasAccess('Checklist') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'Checklist' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('Checklist');
                      setSelectedArtForModal(null);
                      setSelectedVehiculo(null);
                      fetchAllChecklists();
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">assignment_turned_in</span>
                    <span className="menu-item-text">Checklists Diarios</span>
                  </button>
                </li>
              )}
            </>
          )}

          {/* SISTEMA */}
          {(hasAccess('Mantenedores') || hasAccess('Usuarios') || hasAccess('Perfiles')) && (
            <>
              <li className="sidebar-section-header">
                {!isSidebarCollapsed ? 'Sistema' : <div style={{ height: '1px', background: 'var(--card-border, #e2e8f0)', margin: '8px 12px' }} />}
              </li>

              {hasAccess('Mantenedores') && (
                <li>
                  <button
                    className={`menu-item ${currentView === 'Mantenedores' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView('Mantenedores');
                      setSelectedArtForModal(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">tune</span>
                    <span className="menu-item-text">Mantenedores</span>
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
                      setSelectedArtForModal(null);
                    }}
                    style={{ paddingLeft: !isSidebarCollapsed ? '32px' : '20px' }}
                  >
                    <span className="material-symbols-outlined menu-item-icon">admin_panel_settings</span>
                    <span className="menu-item-text">Administración</span>
                  </button>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          {showInstallBtn && (
            <button className="install-btn" onClick={handleInstallApp} title="Instalar aplicación en tu dispositivo">
              <span className="material-symbols-outlined menu-item-icon">download_for_offline</span>
              {!isSidebarCollapsed && <span className="install-text">Instalar App</span>}
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="material-symbols-outlined menu-item-icon">logout</span>
            <span className="logout-text">Cerrar Sesión</span>
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
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '20%' }}>SI</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '20%' }}>NO</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #94a3b8', textAlign: 'center', width: '20%' }}>N/A</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {risk.filas.map((row, idx) => (
                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>
                                            {row.numero ? `N° ${row.numero}` : '-'}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                                            {row.cumple && !row.noAplica ? '✓' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                                            {!row.cumple && !row.noAplica ? '✗' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#006064' }}>
                                            {row.noAplica ? '✓' : ''}
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
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '20%' }}>SI</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '20%' }}>NO</th>
                                        <th style={{ padding: '3px 4px', border: '1px solid #c084fc', textAlign: 'center', width: '20%' }}>N/A</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {risk.filas.map((row, idx) => (
                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fcf8ff' }}>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold' }}>
                                            {row.numero ? `N° ${row.numero}` : '-'}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }}>
                                            {row.cumple && !row.noAplica ? '✓' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                                            {!row.cumple && !row.noAplica ? '✗' : ''}
                                          </td>
                                          <td style={{ padding: '3px 4px', border: '1px solid #e9d5ff', textAlign: 'center', fontWeight: 'bold', color: '#006064' }}>
                                            {row.noAplica ? '✓' : ''}
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

                <div className="dashboard-shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {hasAccess('Formulario') && (
                    <div className="p-6 rounded-2xl text-white shadow-md flex flex-col justify-between gap-4" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 100%)', borderRadius: '16px', minHeight: '160px' }}>
                      <div>
                        <h3 className="text-xl font-bold mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', color: '#ffffff' }}>
                          <span>⚡</span> Registrar Nuevo Formulario ART
                        </h3>
                        <p className="text-sm opacity-90" style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: '#bfdbfe', lineHeight: '1.4' }}>
                          Inicie la planificación, autoverificación y firmas digitales de análisis de riesgos en terreno de forma inmediata.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentView('Formulario');
                          handleWizardReset();
                          setSelectedArtForModal(null);
                        }} 
                        className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:scale-105 transform active:scale-95"
                        style={{ fontSize: '14px', border: 'none', color: '#1e40af', background: '#ffffff', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', width: 'fit-content' }}
                      >
                        📝 Iniciar Formulario ART
                      </button>
                    </div>
                  )}

                  {hasAccess('RevisionTecnica') && (
                    <div className="p-6 rounded-2xl text-white shadow-md flex flex-col justify-between gap-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '16px', minHeight: '160px' }}>
                      <div>
                        <h3 className="text-xl font-bold mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', color: '#ffffff' }}>
                          <span>📋</span> Crear Checklist Camión Tanque
                        </h3>
                        <p className="text-sm opacity-90" style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: '#a7f3d0', lineHeight: '1.4' }}>
                          Realice la inspección pre-operacional diaria del camión tanque para asegurar el cumplimiento de estándares de seguridad.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentView('Checklist');
                          setSelectedArtForModal(null);
                          setSelectedVehiculo(null);
                          fetchAllChecklists();
                        }} 
                        className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:scale-105 transform active:scale-95"
                        style={{ fontSize: '14px', border: 'none', color: '#059669', background: '#ffffff', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', width: 'fit-content' }}
                      >
                        🚛 Iniciar Checklist
                      </button>
                    </div>
                  )}
                </div>

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

                {/* VEHICLES AND FLOTA KPI GRID */}
                <h3 className="text-lg font-bold mb-4 mt-8 text-slate-800 dark:text-white flex items-center gap-2">
                  <span>📊</span> Alertas de Flota y Control de Equipos MIES
                </h3>
                <div className="kpi-grid mb-6">
                  <div className="kpi-card" style={{ borderLeft: '5px solid var(--error-red)' }}>
                    <span className="kpi-label" style={{ fontWeight: '600' }}>Vehículos con RT Vencida</span>
                    <span className="kpi-value" style={{ color: 'var(--error-red)', fontSize: '2rem', display: 'block', margin: '5px 0' }}>
                      {vehiculosConRTVencida.length}
                    </span>
                    <span className="kpi-desc" style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>
                      {vehiculosConRTVencida.length > 0 ? (
                        <>
                          Patentes:{' '}
                          {vehiculosConRTVencida.map((v, i) => (
                            <span key={v.id}>
                              {i > 0 && ', '}
                              <button
                                onClick={() => {
                                  setCurrentView('RevisionTecnica');
                                  setSelectedTipoTab(v.tipo as 'camion' | 'camioneta' | 'equipo');
                                  setSelectedVehiculo(v);
                                }}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '500' }}
                                title="Ver detalles del vehículo"
                              >
                                {v.patente}
                              </button>
                            </span>
                          ))}
                        </>
                      ) : (
                        'No hay vehículos con RT vencida'
                      )}
                    </span>
                  </div>
                  <div className="kpi-card" style={{ borderLeft: '5px solid #ea580c' }}>
                    <span className="kpi-label" style={{ fontWeight: '600' }}>Equipos con Certificado Vencido</span>
                    <span className="kpi-value" style={{ color: '#ea580c', fontSize: '2rem', display: 'block', margin: '5px 0' }}>
                      {equiposConCertVencido.length}
                    </span>
                    <span className="kpi-desc" style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>
                      {equiposConCertVencido.length > 0 ? (
                        <>
                          Equipos:{' '}
                          {equiposConCertVencido.map((v, i) => (
                            <span key={v.id}>
                              {i > 0 && ', '}
                              <button
                                onClick={() => {
                                  setCurrentView('RevisionTecnica');
                                  setSelectedTipoTab(v.tipo as 'camion' | 'camioneta' | 'equipo');
                                  setSelectedVehiculo(v);
                                }}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '500' }}
                                title="Ver detalles del equipo"
                              >
                                {v.patente}
                              </button>
                            </span>
                          ))}
                        </>
                      ) : (
                        'No hay equipos con certificado vencido'
                      )}
                    </span>
                  </div>
                  <div className="kpi-card" style={{ borderLeft: '5px solid #7c3aed' }}>
                    <span className="kpi-label" style={{ fontWeight: '600' }}>Permisos de Circulación Vencidos</span>
                    <span className="kpi-value" style={{ color: '#7c3aed', fontSize: '2rem', display: 'block', margin: '5px 0' }}>
                      {vehiculosConPCVencido.length}
                    </span>
                    <span className="kpi-desc" style={{ fontSize: '0.85rem', color: 'var(--text-color-secondary)' }}>
                      {vehiculosConPCVencido.length > 0 ? (
                        <>
                          Patentes:{' '}
                          {vehiculosConPCVencido.map((v, i) => (
                            <span key={v.id}>
                              {i > 0 && ', '}
                              <button
                                onClick={() => {
                                  setCurrentView('RevisionTecnica');
                                  setSelectedTipoTab(v.tipo as 'camion' | 'camioneta' | 'equipo');
                                  setSelectedVehiculo(v);
                                }}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', fontWeight: '500' }}
                                title="Ver detalles del vehículo/equipo"
                              >
                                {v.patente}
                              </button>
                            </span>
                          ))}
                        </>
                      ) : (
                        'No hay permisos vencidos'
                      )}
                    </span>
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

            {/* VIEW: REVISIÓN TÉCNICA Y GESTIÓN DE VEHÍCULOS */}
            {currentView === 'RevisionTecnica' && hasAccess('RevisionTecnica') && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {dbError && (
                  <div className="alert-banner error" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="alert-icon">⚠️</span>
                      <span className="alert-desc" style={{ color: 'var(--text-color)', fontWeight: '500' }}>{dbError}</span>
                    </div>
                    <button 
                      onClick={() => setDbError(null)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                      title="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                )}
                {/* CABECERA DE LA VISTA */}
                <div className="view-header print-avoid">
                  <div>
                    <h2>Gestión de Vehículos y Revisión Técnica</h2>
                    <p>Controles de vencimientos de RT, Permiso de Circulación, kilometraje y Mina Subterránea Andina.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => setViewType(viewType === 'cards' ? 'grid' : 'cards')}>
                      {viewType === 'cards' ? '📋 Vista Tabla' : '🎴 Vista Tarjetas'}
                    </button>
                    {currentUser?.perfil !== 'Operador' && (
                      <>
                        <button className="btn-secondary" onClick={() => setShowMantenedoresModal(true)}>
                          ⚙️ Mantenedores
                        </button>
                        <button className="btn-primary" onClick={openCreateVehiculoModal}>
                          ➕ Registrar Vehículo/Equipo
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* FILTROS DE BÚSQUEDA Y SELECCIÓN */}
                <div className="filters-card print-avoid">
                  <div className="filter-field">
                    <label>Buscar Patente / Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej. PHYX-94 o PJHD-93..."
                      value={filterVehiculoSearch}
                      onChange={(e) => setFilterVehiculoSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-field">
                    <label>Estado Alerta</label>
                    <select value={filterVehiculoEstado} onChange={(e) => setFilterVehiculoEstado(e.target.value)}>
                      <option value="ALL">Todos los Estados</option>
                      <option value="vigente">Vigente (OK)</option>
                      <option value="cordinar envió">Coordinar Envió</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                  <div className="filter-field">
                    <label>Faena</label>
                    <select value={filterVehiculoFaena} onChange={(e) => setFilterVehiculoFaena(e.target.value)}>
                      <option value="ALL">Todas las Faenas</option>
                      {mantenedores.filter(m => m.categoria === 'faena').map(m => (
                        <option key={m.id} value={m.valor}>{m.valor}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-field">
                    <label>Contratista</label>
                    <select value={filterVehiculoContratista} onChange={(e) => setFilterVehiculoContratista(e.target.value)}>
                      <option value="ALL">Todos los Contratistas</option>
                      {mantenedores.filter(m => m.categoria === 'contratista').map(m => (
                        <option key={m.id} value={m.valor}>{m.valor}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PESTAÑAS DE FILTRADO POR TIPO */}
                <div className="veh-type-tabs print-avoid">
                  <button className={`veh-type-tab-btn ${selectedTipoTab === 'camion' ? 'active' : ''}`} onClick={() => { setSelectedTipoTab('camion'); setSelectedVehiculo(null); }}>
                    🚚 Camiones ({vehiculos.filter(v => v.tipo === 'camion').length})
                  </button>
                  <button className={`veh-type-tab-btn ${selectedTipoTab === 'camioneta' ? 'active' : ''}`} onClick={() => { setSelectedTipoTab('camioneta'); setSelectedVehiculo(null); }}>
                    🛻 Camionetas ({vehiculos.filter(v => v.tipo === 'camioneta').length})
                  </button>
                  <button className={`veh-type-tab-btn ${selectedTipoTab === 'equipo' ? 'active' : ''}`} onClick={() => { setSelectedTipoTab('equipo'); setSelectedVehiculo(null); }}>
                    🏗️ Equipos Certificados ({vehiculos.filter(v => v.tipo === 'equipo').length})
                  </button>
                </div>

                {/* LOGICA DE LISTADO CON FILTROS REACTIVOS */}
                {(() => {
                  const filtered = vehiculos.filter(v => {
                    if (v.tipo !== selectedTipoTab) return false;
                    
                    const query = filterVehiculoSearch.toLowerCase();
                    const matchesSearch = v.patente.toLowerCase().includes(query);
                    const matchesFaena = filterVehiculoFaena === 'ALL' || v.faena === filterVehiculoFaena;
                    const matchesContr = filterVehiculoContratista === 'ALL' || v.contratista === filterVehiculoContratista;
                    
                    let matchesEstado = true;
                    if (filterVehiculoEstado !== 'ALL') {
                      if (v.tipo === 'equipo') {
                        matchesEstado = v.estadoRT === filterVehiculoEstado; // En equipo mapea RT como Certificado
                      } else {
                        matchesEstado = v.estadoRT === filterVehiculoEstado || v.estadoMina === filterVehiculoEstado;
                      }
                    }
                    
                    return matchesSearch && matchesFaena && matchesContr && matchesEstado;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="form-card text-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
                        No se encontraron registros de {selectedTipoTab === 'camion' ? 'camiones' : selectedTipoTab === 'camioneta' ? 'camionetas' : 'equipos'} con los criterios de búsqueda establecidos.
                      </div>
                    );
                  }

                  if (viewType === 'cards') {
                    return (
                      <div className="vehicle-cards-grid">
                        {filtered.map(v => {
                          return (
                            <div key={v.id} className="vehicle-card" onClick={() => { setSelectedVehiculo(v); fetchKilometrajes(v.id); fetchChecklists(v.id); }}>
                              <div className="vehicle-card-img-wrap">
                                <img src={v.fotoUrl || ''} alt={v.patente} className="vehicle-card-img" />
                                <span className="vehicle-card-badge">{v.tipo}</span>
                              </div>
                              <div className="vehicle-card-body">
                                <h3 className="vehicle-card-title">{v.patente}</h3>
                                <div className="vehicle-card-meta">
                                  <span>🏢 <strong>Faena:</strong> {v.faena}</span>
                                  <span>🛡️ <strong>Contratista:</strong> {v.contratista}</span>
                                </div>
                                <div className="vehicle-status-pills">
                                  {v.tipo !== 'equipo' ? (
                                    <>
                                      <div className={`status-pill ${v.estadoRT === 'vigente' ? 'vigente' : v.estadoRT === 'cordinar envió' ? 'cordinar' : 'vencido'}`}>
                                        <span>RT ({v.fechaVencimientoRT || 'Sin fecha'})</span>
                                        <span>{v.estadoRT === 'vigente' ? '🟢 Vigente' : v.estadoRT === 'cordinar envió' ? `⚠️ Coordinar (${v.diasParaRT}d)` : '🔴 Vencido'}</span>
                                      </div>
                                      <div className={`status-pill ${v.estadoMina === 'vigente' ? 'vigente' : v.estadoMina === 'cordinar envió' ? 'cordinar' : 'vencido'}`}>
                                        <span>Mina Andina</span>
                                        <span>{v.estadoMina === 'vigente' ? '🟢 Vigente' : v.estadoMina === 'cordinar envió' ? `⚠️ Control (${v.diasParaMinaControl}d)` : '🔴 Vencido'}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className={`status-pill ${v.estadoRT === 'vigente' ? 'vigente' : v.estadoRT === 'cordinar envió' ? 'cordinar' : 'vencido'}`}>
                                      <span>Certificado ({v.fechaVencimientoCertificado || 'Sin fecha'})</span>
                                      <span>{v.estadoRT === 'vigente' ? '🟢 Vigente' : v.estadoRT === 'cordinar envió' ? `⚠️ Vence (${v.diasParaCertificado}d)` : '🔴 Vencido'}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  } else {
                    return (
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Foto</th>
                              <th>{selectedTipoTab === 'equipo' ? 'Nombre Equipo' : 'Patente'}</th>
                              <th>Faena</th>
                              <th>Contratista</th>
                              {selectedTipoTab === 'equipo' ? (
                                <>
                                  <th>N° Certificado</th>
                                  <th>Fecha Emisión</th>
                                  <th>Vencimiento</th>
                                  <th>Días por Vencer</th>
                                </>
                              ) : (
                                <>
                                  <th>Fecha RT</th>
                                  <th>Días RT</th>
                                  <th>Permiso Circulación</th>
                                  <th>Mina Control</th>
                                  <th>Días Mina</th>
                                </>
                              )}
                              <th>Estado General</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map(v => {
                              return (
                                <tr key={v.id} onClick={() => { setSelectedVehiculo(v); fetchKilometrajes(v.id); fetchChecklists(v.id); }} style={{ cursor: 'pointer' }}>
                                  <td>
                                    <img src={v.fotoUrl || ''} alt={v.patente} style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                  </td>
                                  <td className="font-mono font-bold">{v.patente}</td>
                                  <td>{v.faena}</td>
                                  <td>{v.contratista}</td>
                                  {v.tipo === 'equipo' ? (
                                    <>
                                      <td className="font-semibold">{v.numCertificado || 'N/A'}</td>
                                      <td>{v.fechaEmisionCertificado || 'N/A'}</td>
                                      <td>{v.fechaVencimientoCertificado || 'N/A'}</td>
                                      <td className="font-bold">{v.diasParaCertificado !== null ? `${v.diasParaCertificado} días` : 'N/A'}</td>
                                    </>
                                  ) : (
                                    <>
                                      <td>{v.fechaVencimientoRT || 'N/A'}</td>
                                      <td className="font-semibold">{v.diasParaRT !== null ? `${v.diasParaRT} d` : 'N/A'}</td>
                                      <td>{v.fechaVencimientoPermisoCirc || 'N/A'}</td>
                                      <td>{v.minaFechaVencimiento || 'N/A'}</td>
                                      <td className="font-semibold">{v.diasParaMinaControl !== null ? `${v.diasParaMinaControl} d` : 'N/A'}</td>
                                    </>
                                  )}
                                  <td>
                                    <span className={`table-badge ${v.estadoRT === 'vigente' ? 'approved' : v.estadoRT === 'cordinar envió' ? 'rate' : 'rejected'}`}>
                                      {v.tipo === 'equipo' ? `Certificado ${v.estadoRT}` : `RT ${v.estadoRT}`}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                })()}

                {/* DETALLE LATERAL (DRAWER DETALLADO CON FOTO, ALERTAS Y CALENDARIO) */}
                {selectedVehiculo && (
                  <div className="drawer-overlay" onClick={() => setSelectedVehiculo(null)}>
                    <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
                      <div className="drawer-header">
                        <h3>Ficha Técnica: {selectedVehiculo.patente}</h3>
                        <button className="action-icon-btn" onClick={() => setSelectedVehiculo(null)} style={{ fontSize: '24px' }}>×</button>
                      </div>
                      <div className="drawer-body">
                        {/* COLUMNA 1: INFO Y FOTO */}
                        <div className="detail-info-block">
                          <img
                            src={selectedVehiculo.fotoUrl || ''}
                            alt={selectedVehiculo.patente}
                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}
                          />
                          <div className="detail-info-grid">
                            <div className="detail-info-row">
                              <span className="detail-info-label">Tipo Registro</span>
                              <span className="detail-info-val" style={{ textTransform: 'uppercase' }}>{selectedVehiculo.tipo}</span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Faena Operación</span>
                              <span className="detail-info-val">{selectedVehiculo.faena}</span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Contratista Cargo</span>
                              <span className="detail-info-val">{selectedVehiculo.contratista}</span>
                            </div>

                            {selectedVehiculo.tipo === 'equipo' ? (
                              <>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">N° Certificado</span>
                                  <span className="detail-info-val">{selectedVehiculo.numCertificado || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Fecha Emisión</span>
                                  <span className="detail-info-val">{selectedVehiculo.fechaEmisionCertificado || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Vencimiento Certificado</span>
                                  <span className="detail-info-val">{selectedVehiculo.fechaVencimientoCertificado || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row" style={{ background: selectedVehiculo.estadoRT === 'vencido' ? 'var(--error-bg)' : selectedVehiculo.estadoRT === 'cordinar envió' ? 'var(--warning-bg)' : 'var(--success-bg)' }}>
                                  <span className="detail-info-label">Días por vencer</span>
                                  <span className="detail-info-val" style={{ color: selectedVehiculo.estadoRT === 'vencido' ? 'var(--error-red)' : selectedVehiculo.estadoRT === 'cordinar envió' ? 'var(--warning-amber)' : 'var(--success-green)' }}>
                                    {selectedVehiculo.diasParaCertificado !== null ? `${selectedVehiculo.diasParaCertificado} días` : 'N/A'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Vencimiento RT</span>
                                  <span className="detail-info-val">{selectedVehiculo.fechaVencimientoRT || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row" style={{ background: selectedVehiculo.estadoRT === 'vencido' ? 'var(--error-bg)' : selectedVehiculo.estadoRT === 'cordinar envió' ? 'var(--warning-bg)' : 'var(--success-bg)' }}>
                                  <span className="detail-info-label">Días para RT</span>
                                  <span className="detail-info-val" style={{ color: selectedVehiculo.estadoRT === 'vencido' ? 'var(--error-red)' : selectedVehiculo.estadoRT === 'cordinar envió' ? 'var(--warning-amber)' : 'var(--success-green)' }}>
                                    {selectedVehiculo.diasParaRT !== null ? `${selectedVehiculo.diasParaRT} días (${selectedVehiculo.estadoRT})` : 'N/A'}
                                  </span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Permiso Circulación Venc.</span>
                                  <span className="detail-info-val">{selectedVehiculo.fechaVencimientoPermisoCirc || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Días Permiso Circ.</span>
                                  <span className="detail-info-val font-bold">
                                    {selectedVehiculo.diasParaPermisoCirc !== null ? `${selectedVehiculo.diasParaPermisoCirc} días` : 'N/A'}
                                  </span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Mina Control Ingreso</span>
                                  <span className="detail-info-val">{selectedVehiculo.minaFechaControl || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row">
                                  <span className="detail-info-label">Mina Vencimiento Ingreso</span>
                                  <span className="detail-info-val">{selectedVehiculo.minaFechaVencimiento || 'No registrado'}</span>
                                </div>
                                <div className="detail-info-row" style={{ background: selectedVehiculo.estadoMina === 'vencido' ? 'var(--error-bg)' : selectedVehiculo.estadoMina === 'cordinar envió' ? 'var(--warning-bg)' : 'var(--success-bg)' }}>
                                  <span className="detail-info-label">Días Control Mina</span>
                                  <span className="detail-info-val" style={{ color: selectedVehiculo.estadoMina === 'vencido' ? 'var(--error-red)' : selectedVehiculo.estadoMina === 'cordinar envió' ? 'var(--warning-amber)' : 'var(--success-green)' }}>
                                    {selectedVehiculo.diasParaMinaControl !== null ? `${selectedVehiculo.diasParaMinaControl} días (${selectedVehiculo.estadoMina})` : 'N/A'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {selectedVehiculo.tipo === 'camion' && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                                Historial Checklists Diarios
                              </h4>
                              {checklistsList.length === 0 ? (
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                  No hay checklists registrados para este camión.
                                </p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                  {checklistsList.map((ch: any) => {
                                    const isAprobado = ch.estadoCumplimiento === 'APROBADO';
                                    return (
                                      <div 
                                        key={ch.id} 
                                        onClick={() => setSelectedChecklistForView(ch)}
                                        style={{
                                          padding: '8px 10px',
                                          borderRadius: '8px',
                                          border: '1px solid var(--card-border)',
                                          background: '#f8fafc',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                        title="Haga clic para ver detalles del checklist"
                                      >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                                            {new Date(ch.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            Cond: {ch.conductor}
                                          </span>
                                        </div>
                                        <span 
                                          style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            background: isAprobado ? 'var(--success-bg)' : 'var(--error-bg)',
                                            color: isAprobado ? 'var(--success-green)' : 'var(--error-red)'
                                          }}
                                        >
                                          {ch.estadoCumplimiento}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* COLUMNA 2: CALENDARIO DE KILOMETRAJE / HORÓMETRO */}
                        <div>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: 'var(--primary-color)' }}>
                            {selectedVehiculo.tipo === 'equipo' ? '📅 Registro de Horas de Uso por día' : '📅 Registro de Kilometraje Diario'}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            {selectedVehiculo.tipo === 'equipo' 
                              ? 'Haga clic en cualquier día del calendario para ingresar las horas de uso (horómetro) acumuladas por esta unidad.'
                              : 'Haga clic en cualquier día del calendario para ingresar el kilometraje recorrido por esta unidad.'}
                          </p>

                          {/* COMPONENTE WIDGET CALENDARIO */}
                          {(() => {
                            const { days, year, month } = getCalendarDays();
                            const monthNames = [
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ];

                            return (
                              <div className="calendar-widget">
                                <div className="calendar-header">
                                  <h4>{monthNames[month]} {year}</h4>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="calendar-nav-btn" onClick={() => setMileageMonthOffset(mileageMonthOffset - 1)}>◀</button>
                                    <button className="calendar-nav-btn" onClick={() => setMileageMonthOffset(0)}>Hoy</button>
                                    <button className="calendar-nav-btn" onClick={() => setMileageMonthOffset(mileageMonthOffset + 1)}>▶</button>
                                  </div>
                                </div>
                                <div className="calendar-grid">
                                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d, i) => (
                                    <div key={i} className="calendar-weekday">{d}</div>
                                  ))}
                                  {days.map((day, i) => {
                                    const logged = kilometrajesList.find(k => k.fecha === day.dateStr);
                                    return (
                                      <div
                                        key={i}
                                        className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${logged ? 'has-value' : ''}`}
                                        onClick={() => {
                                          if (!day.isCurrentMonth) return;
                                          setCurrentKilometrajeDate(day.dateStr);
                                          setCurrentKilometrajeVal(logged ? logged.kilometraje : 0);
                                          setShowKilometrajeInputModal(true);
                                        }}
                                      >
                                        <span className="calendar-day-num">{day.dayNum}</span>
                                        {logged && (
                                          <span className="calendar-day-value" title={selectedVehiculo.tipo === 'equipo' ? `${logged.kilometraje} hrs` : `${logged.kilometraje} km`}>
                                            {logged.kilometraje}{selectedVehiculo.tipo === 'equipo' ? 'h' : 'k'}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="drawer-footer">
                        {currentUser?.perfil !== 'Operador' && (
                          <>
                            <button className="btn-secondary" style={{ color: 'var(--error-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteVehiculo(selectedVehiculo.id)}>
                              🗑️ Eliminar Registro
                            </button>
                            <button className="btn-secondary" onClick={() => openEditVehiculoModal(selectedVehiculo)}>
                              ✏️ Editar Datos
                            </button>
                          </>
                        )}
                        {selectedVehiculo.tipo === 'camion' && (
                          <button 
                            className="btn-primary" 
                            onClick={() => openNewChecklistModal(selectedVehiculo)} 
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white' }}
                          >
                            📋 Checklist Diario
                          </button>
                        )}
                        <button className="btn-primary" onClick={() => setSelectedVehiculo(null)}>
                          Listo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL: REGISTRAR / EDITAR VEHICULO */}
                {showVehiculoModal && (
                  <div className="modal-overlay" style={{ padding: '40px 20px' }}>
                    <div className="modal-container medium" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div className="modal-header">
                        <h3>{editModeVehiculo ? 'Editar Vehículo / Equipo' : 'Registrar Nuevo Vehículo / Equipo'}</h3>
                        <button className="action-icon-btn" onClick={() => setShowVehiculoModal(false)} style={{ fontSize: '24px' }}>×</button>
                      </div>
                      <form onSubmit={handleSaveVehiculo}>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="form-field">
                            <label>Tipo de Registro <span className="required-star">*</span></label>
                            <select value={formVehTipo} onChange={(e) => setFormVehTipo(e.target.value)} required>
                              <option value="camion">🚚 Camión</option>
                              <option value="camioneta">🛻 Camioneta</option>
                              <option value="equipo">🏗️ Equipo Certificado</option>
                            </select>
                          </div>
                          
                          <div className="form-field">
                            <label>{formVehTipo === 'equipo' ? 'Identificador Equipo' : 'Patente Vehículo'} <span className="required-star">*</span></label>
                            <input
                              type="text"
                              placeholder={formVehTipo === 'equipo' ? 'Ej. Bulldozer Komatsu' : 'Ej. PHYX-94'}
                              value={formVehPatente}
                              onChange={(e) => setFormVehPatente(e.target.value)}
                              required
                              style={{ textTransform: 'uppercase' }}
                            />
                          </div>

                          <div className="form-grid-2">
                            <div className="form-field">
                              <label>Faena <span className="required-star">*</span></label>
                              <select value={formVehFaena} onChange={(e) => setFormVehFaena(e.target.value)} required>
                                {mantenedores.filter(m => m.categoria === 'faena').map(m => (
                                  <option key={m.id} value={m.valor}>{m.valor}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-field">
                              <label>Contratista <span className="required-star">*</span></label>
                              <select value={formVehContratista} onChange={(e) => setFormVehContratista(e.target.value)} required>
                                {mantenedores.filter(m => m.categoria === 'contratista').map(m => (
                                  <option key={m.id} value={m.valor}>{m.valor}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="form-field">
                            <label>URL Foto Vehículo (Opcional)</label>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={formVehFotoUrl}
                              onChange={(e) => setFormVehFotoUrl(e.target.value)}
                            />
                          </div>

                          {/* CAMPOS DEPENDIENTES DE TIPO */}
                          {formVehTipo === 'equipo' ? (
                            <>
                              <div className="form-field">
                                <label>Número Certificación <span className="required-star">*</span></label>
                                <input type="text" placeholder="Ej. 740013" value={formVehNumCertificado} onChange={(e) => setFormVehNumCertificado(e.target.value)} required />
                              </div>
                              <div className="form-grid-2">
                                <div className="form-field">
                                  <label>Fecha Emisión <span className="required-star">*</span></label>
                                  <input type="date" value={formVehFechaEmisionCert} onChange={(e) => setFormVehFechaEmisionCert(e.target.value)} required />
                                </div>
                                <div className="form-field">
                                  <label>Vencimiento Certificación <span className="required-star">*</span></label>
                                  <input type="date" value={formVehFechaVencimientoCert} onChange={(e) => setFormVehFechaVencimientoCert(e.target.value)} required />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="form-grid-2">
                                <div className="form-field">
                                  <label>Última RT</label>
                                  <input type="date" value={formVehFechaRT} onChange={(e) => setFormVehFechaRT(e.target.value)} />
                                </div>
                                <div className="form-field">
                                  <label>Vencimiento RT <span className="required-star">*</span></label>
                                  <input type="date" value={formVehFechaVencimientoRT} onChange={(e) => setFormVehFechaVencimientoRT(e.target.value)} required />
                                </div>
                              </div>
                              <div className="form-field">
                                <label>Vencimiento Permiso Circulación <span className="required-star">*</span></label>
                                <input type="date" value={formVehFechaVencimientoPermisoCirc} onChange={(e) => setFormVehFechaVencimientoPermisoCirc(e.target.value)} required />
                              </div>
                              
                              <div className="form-grid-2" style={{ border: '1.5px solid rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.02)' }}>
                                <div className="form-field col-span-2" style={{ marginBottom: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase' }}>
                                    🚇 Permiso Ingreso Mina Subterránea Andina
                                  </span>
                                </div>
                                <div className="form-field">
                                  <label>Fecha Control</label>
                                  <input type="date" value={formVehMinaFechaControl} onChange={(e) => setFormVehMinaFechaControl(e.target.value)} />
                                </div>
                                <div className="form-field">
                                  <label>Fecha Vencimiento Control</label>
                                  <input type="date" value={formVehMinaFechaVencimiento} onChange={(e) => setFormVehMinaFechaVencimiento(e.target.value)} />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn-secondary" onClick={() => setShowVehiculoModal(false)}>Cancelar</button>
                          <button type="submit" className="btn-primary">Guardar Registro</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: INPUT DIARIO DE KILOMETRAJE / HORÓMETRO */}
                {showKilometrajeInputModal && (
                  <div className="modal-overlay" style={{ zIndex: 110, padding: '40px 20px' }}>
                    <div className="modal-container small" style={{ animation: 'fadeIn 0.2s ease' }}>
                      <div className="modal-header">
                        <h3>{selectedVehiculo?.tipo === 'equipo' ? 'Registrar Horas de Uso' : 'Registrar Kilometraje'}</h3>
                        <button className="action-icon-btn" onClick={() => setShowKilometrajeInputModal(false)}>×</button>
                      </div>
                      <form onSubmit={handleSaveKilometraje}>
                        <div className="modal-body">
                          <div className="form-field" style={{ marginBottom: '15px' }}>
                            <label>Fecha Seleccionada</label>
                            <input type="text" value={currentKilometrajeDate} readOnly style={{ background: '#f1f5f9', fontWeight: 'bold' }} />
                          </div>
                          <div className="form-field">
                            <label>
                              {selectedVehiculo?.tipo === 'equipo' ? 'Horas de Uso (Horómetro acumulado)' : 'Kilometraje Recorrido (KM acumulado)'} <span className="required-star">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={selectedVehiculo?.tipo === 'equipo' ? 'Ej. 4500.5' : 'Ej. 120500'}
                              value={currentKilometrajeVal}
                              onChange={(e) => setCurrentKilometrajeVal(Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn-secondary" onClick={() => setShowKilometrajeInputModal(false)}>Cancelar</button>
                          <button type="submit" className="btn-primary">
                            {selectedVehiculo?.tipo === 'equipo' ? 'Guardar Horas' : 'Guardar KM'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}


                {/* MODAL: GESTIÓN DE MANTENEDORES (CRUD MANTENEDORES) */}
                {showMantenedoresModal && (
                  <div className="modal-overlay" style={{ padding: '40px 20px' }}>
                    <div className="modal-container medium" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div className="modal-header">
                        <h3>Mantenedor de Categorías Auxiliares</h3>
                        <button className="action-icon-btn" onClick={() => setShowMantenedoresModal(false)} style={{ fontSize: '24px' }}>×</button>
                      </div>
                      <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                        {/* LISTA Y CREACIÓN */}
                        <div>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800' }}>Registrar Nuevo Valor</h4>
                          <form onSubmit={handleSaveMantenedor}>
                            <div className="form-field" style={{ marginBottom: '12px' }}>
                              <label>Categoría</label>
                              <select value={formMantCategoria} onChange={(e) => setFormMantCategoria(e.target.value)} required>
                                <option value="faena">Faena de Operación</option>
                                <option value="contratista">Contratista</option>
                              </select>
                            </div>
                            <div className="form-field" style={{ marginBottom: '15px' }}>
                              <label>Nombre / Valor <span className="required-star">*</span></label>
                              <input
                                type="text"
                                placeholder="Ej. Codelco Ventanas"
                                value={formMantValor}
                                onChange={(e) => setFormMantValor(e.target.value)}
                                required
                              />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Agregar Valor</button>
                          </form>
                        </div>
                        
                        {/* VISTA DE VALORES ACTUALES */}
                        <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '20px' }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800' }}>Valores Existentes</h4>
                          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['faena', 'contratista'].map(cat => {
                              const filtered = mantenedores.filter(m => m.categoria === cat);
                              return (
                                <div key={cat} style={{ marginBottom: '10px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                    {cat === 'faena' ? 'Faenas' : 'Contratistas'} ({filtered.length})
                                  </span>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    {filtered.map(m => (
                                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                                        <span>{m.valor}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMantenedor(m.id)}
                                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--error-red)', fontWeight: 'bold' }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button className="btn-primary" onClick={() => setShowMantenedoresModal(false)}>Cerrar</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW: CHECKLISTS DIARIOS */}
            {currentView === 'Checklist' && hasAccess('Checklist') && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {dbError && (
                  <div className="alert-banner error" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="alert-icon">⚠️</span>
                      <span className="alert-desc" style={{ color: 'var(--text-color)', fontWeight: '500' }}>{dbError}</span>
                    </div>
                    <button 
                      onClick={() => setDbError(null)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                      title="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* CABECERA DE LA VISTA */}
                <div className="view-header print-avoid">
                  <div>
                    <h2>Checklists Diarios de Camión Tanque</h2>
                    <p>Cree nuevos checklists de inspección pre-operacional y visualice el registro histórico.</p>
                  </div>
                  <button className="btn-primary" onClick={fetchAllChecklists}>
                    🔄 Actualizar Datos
                  </button>
                </div>

                <div className="checklist-split-view">
                  
                  {/* COLUMNA IZQUIERDA: CREAR CHECKLIST (CAMIONES) */}
                  <div className="card" style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)' }}>
                      🚚 Seleccionar Camión Tanque
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                      Haga clic en "Iniciar" para comenzar la inspección diaria obligatoria del camión.
                    </p>
                    
                    <div className="trucks-list">
                      {(() => {
                        const trucks = vehiculos.filter(v => v.tipo === 'camion').filter(truck => {
                          if (currentUser?.perfil === 'Administrador') return true;
                          const asociados = currentUser?.vehiculosAsociados || [];
                          return asociados.includes(truck.id);
                        });
                        
                        if (trucks.length === 0) {
                          return (
                            <div style={{ textTransform: 'none', fontSize: '12.5px', color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>
                              No hay camiones autorizados o asociados a su cuenta.
                            </div>
                          );
                        }

                        return trucks.map(truck => (
                          <div key={truck.id} className="truck-item">
                            <div>
                              <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>
                                {truck.patente}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {truck.faena || 'Sin Faena'}
                              </span>
                            </div>
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '6px' }}
                              onClick={() => {
                                setSelectedVehiculo(truck);
                                openNewChecklistModal(truck);
                              }}
                            >
                              Iniciar
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: REGISTRO HISTÓRICO */}
                  <div className="card" style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', minHeight: '500px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: 'var(--primary-color)' }}>
                      📜 Registro de Inspecciones Diarias
                    </h3>

                    {/* FILTROS INTERNOS */}
                    <div className="checklist-filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '2', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Buscar por Conductor o Patente</label>
                        <input
                          type="text"
                          placeholder="Nombre conductor, patente..."
                          value={filterChecklistSearch}
                          onChange={(e) => setFilterChecklistSearch(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--input-border)',
                            fontSize: '13px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Estado de Cumplimiento</label>
                        <select
                          value={filterChecklistEstado}
                          onChange={(e) => setFilterChecklistEstado(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--input-border)',
                            fontSize: '13px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="ALL">Todos los Estados</option>
                          <option value="APROBADO">Aprobados (Autorizados)</option>
                          <option value="RECHAZADO">Rechazados (Retenidos)</option>
                        </select>
                      </div>
                    </div>

                    {/* TABLA DE CHECKLISTS */}
                    <div className="table-wrapper">
                      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Patente</th>
                            <th>Conductor</th>
                            <th>Supervisor</th>
                            <th>Cumplimiento</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allChecklistsList
                            .filter(ch => {
                              const matchesSearch = 
                                (ch.conductor || '').toLowerCase().includes(filterChecklistSearch.toLowerCase()) ||
                                (ch.patenteCamion || '').toLowerCase().includes(filterChecklistSearch.toLowerCase()) ||
                                (ch.supervisorCargo || '').toLowerCase().includes(filterChecklistSearch.toLowerCase());
                              const matchesEstado = 
                                filterChecklistEstado === 'ALL' || 
                                ch.estadoCumplimiento === filterChecklistEstado;
                              return matchesSearch && matchesEstado;
                            })
                            .map((ch) => (
                              <tr key={ch.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  {new Date(ch.fecha).toLocaleDateString('es-CL')} {new Date(ch.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ fontWeight: 'bold' }}>{ch.patenteCamion}</td>
                                <td>{ch.conductor}</td>
                                <td>{ch.supervisorCargo || '-'}</td>
                                <td>
                                  <span 
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      background: ch.estadoCumplimiento === 'APROBADO' ? 'var(--success-bg)' : 'var(--error-bg)',
                                      color: ch.estadoCumplimiento === 'APROBADO' ? 'var(--success-green)' : 'var(--error-red)',
                                      border: `1px solid ${ch.estadoCumplimiento === 'APROBADO' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                                    }}
                                  >
                                    {ch.estadoCumplimiento === 'APROBADO' ? 'APROBADO' : 'RECHAZADO'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    className="btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    onClick={() => setSelectedChecklistForView(ch)}
                                  >
                                    Ver Reporte
                                  </button>
                                </td>
                              </tr>
                            ))
                          }
                          {allChecklistsList.filter(ch => {
                            const matchesSearch = 
                              (ch.conductor || '').toLowerCase().includes(filterChecklistSearch.toLowerCase()) ||
                              (ch.patenteCamion || '').toLowerCase().includes(filterChecklistSearch.toLowerCase()) ||
                              (ch.supervisorCargo || '').toLowerCase().includes(filterChecklistSearch.toLowerCase());
                            const matchesEstado = 
                              filterChecklistEstado === 'ALL' || 
                              ch.estadoCumplimiento === filterChecklistEstado;
                            return matchesSearch && matchesEstado;
                          }).length === 0 && (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                No se encontraron registros de checklist.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                            <select
                              value={paso1.supervisor_asigna}
                              onChange={(e) => setPaso1({ ...paso1, supervisor_asigna: e.target.value })}
                              required
                            >
                              <option value="">-- Seleccionar Supervisor --</option>
                              {mantenedores.filter(m => m.categoria === 'supervisor').map(m => (
                                <option key={m.id} value={m.valor}>{m.valor}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field">
                            <label>Empresa ejecutora <span className="required-star">*</span></label>
                            <select
                              value={paso1.empresa}
                              onChange={(e) => setPaso1({ ...paso1, empresa: e.target.value })}
                              required
                            >
                              <option value="Mies - Copec">Mies - Copec</option>
                              <option value="MIES S.A.">MIES S.A.</option>
                            </select>
                          </div>
                          <div className="form-field">
                            <label>Gerencia <span className="required-star">*</span></label>
                            <input type="text" placeholder="Ej. Gser" value={paso1.gerencia} onChange={(e) => setPaso1({ ...paso1, gerencia: e.target.value })} required />
                          </div>
                        </div>
                        <div className="form-grid-3">
                          <div className="form-field">
                            <label>Superintendencia / Dirección</label>
                            <input type="text" placeholder="Ej. logística" value={paso1.superintendencia_direccion} onChange={(e) => setPaso1({ ...paso1, superintendencia_direccion: e.target.value })} />
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
                            <select
                              value={paso1.lugar_especifico}
                              onChange={(e) => setPaso1({ ...paso1, lugar_especifico: e.target.value })}
                              required
                            >
                              <option value="">-- Seleccionar Lugar --</option>
                              {mantenedores.filter(m => m.categoria === 'lugar_faena').map(m => (
                                <option key={m.id} value={m.valor}>{m.valor}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-field" style={{ marginTop: '10px' }}>
                          <label>Trabajo a Realizar <span className="required-star">*</span></label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <select
                              value={
                                mantenedores.some(m => m.categoria === 'trabajo' && m.valor === paso1.trabajo_realizar)
                                  ? paso1.trabajo_realizar
                                  : paso1.trabajo_realizar === '' ? '' : 'OTRO'
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'OTRO') {
                                  setPaso1({ ...paso1, trabajo_realizar: '' });
                                } else {
                                  setPaso1({ ...paso1, trabajo_realizar: val });
                                }
                              }}
                              required
                            >
                              <option value="">-- Seleccionar Trabajo --</option>
                              {mantenedores.filter(m => m.categoria === 'trabajo').map(m => (
                                <option key={m.id} value={m.valor}>{m.valor}</option>
                              ))}
                              <option value="OTRO">Otro (Ingresar descripción manual)...</option>
                            </select>

                            {(!mantenedores.some(m => m.categoria === 'trabajo' && m.valor === paso1.trabajo_realizar) || paso1.trabajo_realizar === '') && (
                              <textarea
                                rows={3}
                                placeholder="Describa detalladamente el trabajo a realizar..."
                                value={paso1.trabajo_realizar}
                                onChange={(e) => setPaso1({ ...paso1, trabajo_realizar: e.target.value })}
                                required
                              />
                            )}
                          </div>
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
                            <label>Seleccionar Procedimiento/Instructivo: <span className="required-star">*</span></label>
                            <MultiSelectProcedimientos
                              selectedString={supervisorCheck.nombre_estandar}
                              onChange={(val) => setSupervisorCheck({ ...supervisorCheck, nombre_estandar: val })}
                              mantenedores={mantenedores}
                            />
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
                            <label>Seleccionar Procedimiento/Instructivo: <span className="required-star">*</span></label>
                            <MultiSelectProcedimientos
                              selectedString={trabajadorCheck.nombre_estandar_trabajador}
                              onChange={(val) => setTrabajadorCheck({ ...trabajadorCheck, nombre_estandar_trabajador: val })}
                              mantenedores={mantenedores}
                            />
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
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)' }}>
                                          Riesgo #{idx + 1}: {risk.nombre || 'Personalizado'}
                                        </span>
                                        <a
                                          href="/docs/SIGO-G-012 Rev 002 Controles Críticos Que Salvan Vidas.pdf"
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ display: 'inline-flex', alignSelf: 'center', textDecoration: 'none', color: 'var(--error-red)' }}
                                          title="Ver Ayuda Memoria: SIGO-G-012 Controles Críticos"
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 'bold' }}>picture_as_pdf</span>
                                        </a>
                                      </div>
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
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', width: '40%' }}>Control / N°</th>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', width: '20%' }}>SÍ</th>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', width: '20%' }}>NO</th>
                                            <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', width: '20%' }}>N/A</th>
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
                                                style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer', background: row.cumple && !row.noAplica ? '#e8f5e9' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('supervisor', idx, rowIdx, 'cumple', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.cumple && !row.noAplica ? '#2e7d32' : '#94a3b8' }}>
                                                  {row.cumple && !row.noAplica ? '✓ SI' : 'SI'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer', background: !row.cumple && !row.noAplica ? '#ffebee' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('supervisor', idx, rowIdx, 'cumple', false)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: !row.cumple && !row.noAplica ? '#c62828' : '#94a3b8' }}>
                                                  {!row.cumple && !row.noAplica ? '✗ NO' : 'NO'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer', background: row.noAplica ? '#e0f7fa' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('supervisor', idx, rowIdx, 'noAplica', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.noAplica ? '#006064' : '#94a3b8' }}>
                                                  {row.noAplica ? '✓ N/A' : 'N/A'}
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
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-purple)' }}>
                                          Riesgo #{idx + 1}: {risk.nombre || 'Personalizado'}
                                        </span>
                                        <a
                                          href="/docs/SIGO-G-012 Rev 002 Controles Críticos Que Salvan Vidas.pdf"
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ display: 'inline-flex', alignSelf: 'center', textDecoration: 'none', color: 'var(--error-red)' }}
                                          title="Ver Ayuda Memoria: SIGO-G-012 Controles Críticos"
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 'bold' }}>picture_as_pdf</span>
                                        </a>
                                      </div>
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
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'left', width: '40%' }}>Control / N°</th>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'center', width: '20%' }}>SÍ</th>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'center', width: '20%' }}>NO</th>
                                            <th style={{ padding: '8px', border: '1px solid #e9d5ff', textAlign: 'center', width: '20%' }}>N/A</th>
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
                                                style={{ padding: '6px 8px', border: '1px solid #e9d5ff', textAlign: 'center', cursor: 'pointer', background: row.cumple && !row.noAplica ? '#e8f5e9' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('trabajador', idx, rowIdx, 'cumple', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.cumple && !row.noAplica ? '#2e7d32' : '#94a3b8' }}>
                                                  {row.cumple && !row.noAplica ? '✓ SI' : 'SI'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #e9d5ff', textAlign: 'center', cursor: 'pointer', background: !row.cumple && !row.noAplica ? '#ffebee' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('trabajador', idx, rowIdx, 'cumple', false)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: !row.cumple && !row.noAplica ? '#c62828' : '#94a3b8' }}>
                                                  {!row.cumple && !row.noAplica ? '✗ NO' : 'NO'}
                                                </span>
                                              </td>
                                              <td
                                                style={{ padding: '6px 8px', border: '1px solid #e9d5ff', textAlign: 'center', cursor: 'pointer', background: row.noAplica ? '#e0f7fa' : 'transparent', transition: 'all 0.2s' }}
                                                onClick={() => handleRowChange('trabajador', idx, rowIdx, 'noAplica', true)}
                                              >
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: row.noAplica ? '#006064' : '#94a3b8' }}>
                                                  {row.noAplica ? '✓ N/A' : 'N/A'}
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

                        {/* Chips interactivos de riesgos predefinidos */}
                        <div style={{ marginBottom: '20px', background: '#faf5ff', padding: '15px', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
                          <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#6d28d9', marginBottom: '8px' }}>
                            💡 Riesgos Predefinidos Rápidos (Haga clic para agregar):
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(() => {
                              const DEFAULT_PREDEFINED_RIESGOS = [
                                { riesgo: 'No realizar ART', medida_control: 'Siempre realizar ART en el lugar de trabajo' },
                                { riesgo: 'No uso de EPP', medida_control: 'Usar EPP en buen estado y adecuado al trabajo a realizar' },
                                { riesgo: 'Caída mismo nivel', medida_control: 'Caminar con cuidado atento a las condiciones del terreno' },
                                { riesgo: 'Radiación UV', medida_control: 'Usar bloqueador solar' }
                              ];
                              const dbRiesgos = mantenedores
                                .filter(m => m.categoria === 'riesgo_localizado')
                                .map(m => {
                                  try {
                                    return JSON.parse(m.valor);
                                  } catch (e) {
                                    return null;
                                  }
                                })
                                .filter(Boolean);
                              const list = dbRiesgos.length > 0 ? dbRiesgos : DEFAULT_PREDEFINED_RIESGOS;
                              return list.map((item: any, idx: number) => {
                                const isAlreadySelected = paso3.some(p => p.riesgo === item.riesgo);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddPredefinedRiesgo(item.riesgo, item.medida_control)}
                                    disabled={isAlreadySelected}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      borderRadius: '20px',
                                      border: isAlreadySelected ? '1px solid #cbd5e1' : '1px solid #d8b4fe',
                                      background: isAlreadySelected ? '#f1f5f9' : '#ffffff',
                                      color: isAlreadySelected ? '#94a3b8' : '#6d28d9',
                                      cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                      opacity: isAlreadySelected ? 0.6 : 1
                                    }}
                                    onMouseOver={(e) => {
                                      if (!isAlreadySelected) e.currentTarget.style.background = '#f3e8ff';
                                    }}
                                    onMouseOut={(e) => {
                                      if (!isAlreadySelected) e.currentTarget.style.background = '#ffffff';
                                    }}
                                  >
                                    {isAlreadySelected ? '✓' : '⚡'} {item.riesgo}
                                  </button>
                                );
                              });
                            })()}
                          </div>
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

            {/* VIEW 3.5: ART POR FINALIZAR */}
            {currentView === 'ArtPorFinalizar' && hasAccess('ArtPorFinalizar') && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Bandeja de ART por Finalizar</h2>
                    <p>Revise y cierre los Análisis de Riesgo del Trabajo aprobados que continúan en proceso.</p>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={fetchARTs}>
                    🔄 Sincronizar Bandeja
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Seguimiento</th>
                        <th>Fecha Ingreso</th>
                        <th>Empresa</th>
                        <th>Supervisor Asigna</th>
                        <th>Lugar de Faena</th>
                        <th>Trabajo a Realizar</th>
                        <th>Estado Cierre</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const pendingList = artList.filter(art => {
                          const estFin = art.estadoFinalizacion || 'EN_PROCESO';
                          return estFin === 'EN_PROCESO' && art.estado === 'APPROVED_WORK_AUTHORIZED';
                        });

                        if (pendingList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>task_alt</span>
                                  <span style={{ fontWeight: '600' }}>No hay formularios ART pendientes de finalización</span>
                                  <span style={{ fontSize: '12px' }}>Todos los trabajos aprobados han sido debidamente cerrados.</span>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return pendingList.map((art) => (
                          <tr key={art.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-color)' }}>{art.codigoSeguimiento}</td>
                            <td>{new Date(art.createdAt).toLocaleString()}</td>
                            <td className="font-semibold">{art.paso1Planificacion.empresa}</td>
                            <td>{art.paso1Planificacion.supervisor_asigna}</td>
                            <td>{art.paso1Planificacion.lugar_especifico || 'No especificado'}</td>
                            <td>{art.paso1Planificacion.trabajo_realizar}</td>
                            <td>
                              <span className="table-badge rate" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-amber)', border: 'none' }}>
                                EN PROCESO
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  onClick={() => handleFinalizarART(art.id)}
                                  disabled={currentUser?.perfil !== 'Supervisor' && currentUser?.perfil !== 'Administrador'}
                                  title={currentUser?.perfil !== 'Supervisor' && currentUser?.perfil !== 'Administrador' ? 'Solo Supervisor o Administrador puede finalizar' : 'Finalizar y cerrar este formulario ART'}
                                >
                                  🔐 Finalizar ART
                                </button>
                                <button
                                  type="button"
                                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  onClick={() => setSelectedArtForModal(art)}
                                  title="Ver ART Completo"
                                >
                                  👁️ Ver Detalle
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
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
                        <div className="modal-container large">
                          <div className="modal-header">
                            <h3>{editModeUser ? 'Editar Colaborador' : 'Agregar Nuevo Colaborador'}</h3>
                            <button className="action-icon-btn" onClick={() => setShowUserModal(false)} style={{ fontSize: '20px' }}>×</button>
                          </div>
                          <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="form-grid-2">
                              {/* Left Column: Basic Information */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                  <select value={formUserPerfil} onChange={(e) => {
                                    const newPerfil = e.target.value as any;
                                    setFormUserPerfil(newPerfil);
                                    const defaultScreens = profilePermissions.find(p => p.rol === newPerfil)?.screens || {};
                                    setFormUserScreens({ ...defaultScreens });
                                  }}>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Operador">Operador</option>
                                  </select>
                                </div>
                                <div className="form-field">
                                  <label>Contraseña de Acceso <span className="required-star">*</span></label>
                                  <input 
                                    type="text" 
                                    placeholder="Ej. admin123" 
                                    value={formUserPassword} 
                                    onChange={(e) => setFormUserPassword(e.target.value)} 
                                    required 
                                  />
                                </div>
                              </div>

                              {/* Right Column: Permissions & Vehicles */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                                <div className="form-field">
                                  <label>Pantallas Habilitadas</label>
                                  {formUserPerfil === 'Administrador' ? (
                                    <div style={{
                                      padding: '10px 12px',
                                      borderRadius: '8px',
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      border: '1px solid rgba(16, 185, 129, 0.2)',
                                      color: 'var(--success-green)',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
                                      🛡️ Los administradores tienen acceso completo a todas las pantallas.
                                    </div>
                                  ) : (
                                    <div style={{
                                      maxHeight: '130px',
                                      overflowY: 'auto',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '8px',
                                      padding: '10px',
                                      background: '#f8fafc',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                      marginTop: '4px'
                                    }}>
                                      {[
                                        { key: 'Dashboard', label: '📊 Panel de Control (Dashboard)' },
                                        { key: 'Formulario', label: '📝 Nuevo Formulario ART' },
                                        { key: 'Historial', label: '🗂️ Historial ART' },
                                        { key: 'Checklist', label: '📋 Checklists Diarios' },
                                        { key: 'RevisionTecnica', label: '🚚 Gestión de Vehículos' },
                                        { key: 'ArtPorFinalizar', label: '⏳ ART por Finalizar' },
                                        { key: 'Mantenedores', label: '⚙️ Mantenedores' },
                                        { key: 'Usuarios', label: '👥 Administración' },
                                        { key: 'Perfiles', label: '🛡️ Matriz de Perfiles' }
                                      ].map(screen => {
                                        const isChecked = !!formUserScreens[screen.key as keyof ProfilePermissions['screens']];
                                        return (
                                          <label key={screen.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => {
                                                setFormUserScreens({
                                                  ...formUserScreens,
                                                  [screen.key]: e.target.checked
                                                });
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            <span>{screen.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="form-field">
                                  <label>Vehículos / Equipos Asociados</label>
                                  <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    marginTop: '4px'
                                  }}>
                                    {/* CAMIONES */}
                                    {vehiculos.filter(v => v.tipo === 'camion').length > 0 && (
                                      <div>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary-color)', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                                          🚚 Camiones
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                                          {vehiculos.filter(v => v.tipo === 'camion').map(v => {
                                            const isChecked = formUserVehiculos.includes(v.id);
                                            return (
                                              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setFormUserVehiculos([...formUserVehiculos, v.id]);
                                                    } else {
                                                      setFormUserVehiculos(formUserVehiculos.filter(id => id !== v.id));
                                                    }
                                                  }}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                                <span><strong>{v.patente}</strong> - {v.faena}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* CAMIONETAS */}
                                    {vehiculos.filter(v => v.tipo === 'camioneta').length > 0 && (
                                      <div>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                                          🚗 Camionetas
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                                          {vehiculos.filter(v => v.tipo === 'camioneta').map(v => {
                                            const isChecked = formUserVehiculos.includes(v.id);
                                            return (
                                              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setFormUserVehiculos([...formUserVehiculos, v.id]);
                                                    } else {
                                                      setFormUserVehiculos(formUserVehiculos.filter(id => id !== v.id));
                                                    }
                                                  }}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                                <span><strong>{v.patente}</strong> - {v.faena}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* EQUIPOS CERTIFICADOS */}
                                    {vehiculos.filter(v => v.tipo !== 'camion' && v.tipo !== 'camioneta').length > 0 && (
                                      <div>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#4b5563', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                                          ⚙️ Equipos Certificados
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                                          {vehiculos.filter(v => v.tipo !== 'camion' && v.tipo !== 'camioneta').map(v => {
                                            const isChecked = formUserVehiculos.includes(v.id);
                                            return (
                                              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setFormUserVehiculos([...formUserVehiculos, v.id]);
                                                    } else {
                                                      setFormUserVehiculos(formUserVehiculos.filter(id => id !== v.id));
                                                    }
                                                  }}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                                <span><strong>{v.patente}</strong> - {v.faena}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {vehiculos.length === 0 && (
                                      <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                                        No hay vehículos registrados en el sistema.
                                      </span>
                                    )}
                                  </div>
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
                            <th style={{ textAlign: 'center' }}>📋 Checklists Diarios</th>
                            <th style={{ textAlign: 'center' }}>🚚 Revisión Técnica</th>
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
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.Checklist}
                                    onChange={() => handlePermissionToggle(p.rol, 'Checklist')}
                                  />
                                </label>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={p.screens.RevisionTecnica}
                                    onChange={() => handlePermissionToggle(p.rol, 'RevisionTecnica')}
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

            {/* VIEW 5: MANTENEDORES UNIFICADO */}
            {currentView === 'Mantenedores' && hasAccess('Mantenedores') && (
              <div>
                <div className="view-header">
                  <div>
                    <h2>Mantenedores de Datos Auxiliares</h2>
                    <p>Administre y configure los parámetros, procedimientos y riesgos obligatorios utilizados en los formularios.</p>
                  </div>
                </div>

                {/* Sub-tabs styling layout */}
                <div className="admin-tabs" style={{ marginBottom: '20px' }}>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'supervisor' ? 'active' : ''}`} onClick={() => setMantActiveTab('supervisor')}>👥 Supervisores</button>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'trabajo' ? 'active' : ''}`} onClick={() => setMantActiveTab('trabajo')}>💼 Trabajos</button>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'lugar_faena' ? 'active' : ''}`} onClick={() => setMantActiveTab('lugar_faena')}>📍 Lugares de Faena</button>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'procedimiento' ? 'active' : ''}`} onClick={() => setMantActiveTab('procedimiento')}>📄 Procedimientos/Instructivos</button>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'riesgo_localizado' ? 'active' : ''}`} onClick={() => setMantActiveTab('riesgo_localizado')}>⚠️ Riesgos Predefinidos</button>
                  <button type="button" className={`admin-tab-btn ${mantActiveTab === 'faena_contras' ? 'active' : ''}`} onClick={() => setMantActiveTab('faena_contras')}>🏢 Faenas & Contratistas</button>
                </div>

                <div className="form-card" style={{ padding: '25px' }}>
                  {mantActiveTab === 'supervisor' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Registrar Nuevo Supervisor</h3>
                        <div className="form-field">
                          <label>Nombre del Supervisor <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            value={formSupervisorVal}
                            onChange={(e) => setFormSupervisorVal(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ marginTop: '10px', width: '100%' }}
                          onClick={() => handleAddSimpleMantenedor('supervisor', formSupervisorVal, () => setFormSupervisorVal(''))}
                        >
                          Agregar Supervisor
                        </button>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Supervisores Registrados</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {mantenedores.filter(m => m.categoria === 'supervisor').map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{m.valor}</span>
                              <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(m.id)} style={{ color: 'var(--error-red)' }}>🗑️</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {mantActiveTab === 'trabajo' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Registrar Trabajo Predefinido</h3>
                        <div className="form-field">
                          <label>Trabajo / Faena a Realizar <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Limpieza de estanque de combustible"
                            value={formTrabajoVal}
                            onChange={(e) => setFormTrabajoVal(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ marginTop: '10px', width: '100%' }}
                          onClick={() => handleAddSimpleMantenedor('trabajo', formTrabajoVal, () => setFormTrabajoVal(''))}
                        >
                          Agregar Trabajo
                        </button>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Trabajos Registrados</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {mantenedores.filter(m => m.categoria === 'trabajo').map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{m.valor}</span>
                              <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(m.id)} style={{ color: 'var(--error-red)' }}>🗑️</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {mantActiveTab === 'lugar_faena' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Registrar Lugar de Faena</h3>
                        <div className="form-field">
                          <label>Nombre del Lugar <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Huechun, Saladillo, etc."
                            value={formLugarVal}
                            onChange={(e) => setFormLugarVal(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ marginTop: '10px', width: '100%' }}
                          onClick={() => handleAddSimpleMantenedor('lugar_faena', formLugarVal, () => setFormLugarVal(''))}
                        >
                          Agregar Lugar
                        </button>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Lugares Registrados</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {mantenedores.filter(m => m.categoria === 'lugar_faena').map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{m.valor}</span>
                              <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(m.id)} style={{ color: 'var(--error-red)' }}>🗑️</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {mantActiveTab === 'procedimiento' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Subir Procedimiento / Instructivo</h3>
                        <form onSubmit={handleAddProcedureMantenedor}>
                          <div className="form-field" style={{ marginBottom: '12px' }}>
                            <label>Nombre del Procedimiento <span className="required-star">*</span></label>
                            <input
                              type="text"
                              placeholder="Ej. PO-AC-085 Plan de cierre"
                              value={formProcNombre}
                              onChange={(e) => setFormProcNombre(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-field" style={{ marginBottom: '15px' }}>
                            <label>Adjuntar Documento PDF <span className="required-star">*</span></label>
                            <input
                              type="file"
                              accept=".pdf"
                              required
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFormProcFileName(file.name);
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      const base64 = reader.result.split(',')[1];
                                      setFormProcFileBase64(base64);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%' }}
                            disabled={procUploadLoading}
                          >
                            {procUploadLoading ? 'Subiendo PDF...' : 'Subir y Registrar'}
                          </button>
                        </form>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Procedimientos Registrados</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(() => {
                            const list = mantenedores
                              .filter(m => m.categoria === 'procedimiento')
                              .map(m => {
                                try {
                                  return { id: m.id, ...JSON.parse(m.valor) };
                                } catch(e) {
                                  return { id: m.id, nombre: m.valor, url: '' };
                                }
                              });

                            return list.map(p => (
                              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{p.nombre}</span>
                                  {p.url && (
                                    <a href={p.url.startsWith('http') || p.url.startsWith('/') ? p.url : `/uploads/${p.url}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px', textDecoration: 'none' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>picture_as_pdf</span> Ver PDF
                                    </a>
                                  )}
                                </div>
                                <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(p.id)} style={{ color: 'var(--error-red)' }}>🗑️</button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {mantActiveTab === 'riesgo_localizado' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Registrar Riesgo Predefinido</h3>
                        <div className="form-field" style={{ marginBottom: '12px' }}>
                          <label>Riesgo Específico <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Caída mismo nivel"
                            value={formRiesgoVal}
                            onChange={(e) => setFormRiesgoVal(e.target.value)}
                          />
                        </div>
                        <div className="form-field" style={{ marginBottom: '15px' }}>
                          <label>Medida Mitigadora / Control <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Caminar con cuidado atento a las condiciones"
                            value={formMedidaVal}
                            onChange={(e) => setFormMedidaVal(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ width: '100%' }}
                          onClick={() => handleAddPredefinedRiskMantenedor(formRiesgoVal, formMedidaVal)}
                        >
                          Agregar Riesgo
                        </button>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Riesgos Registrados</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(() => {
                            const list = mantenedores
                              .filter(m => m.categoria === 'riesgo_localizado')
                              .map(m => {
                                try {
                                  return { id: m.id, ...JSON.parse(m.valor) };
                                } catch(e) {
                                  return { id: m.id, riesgo: m.valor, medida_control: '' };
                                }
                              });

                            return list.map(r => (
                              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginRight: '10px' }}>
                                  <span style={{ fontWeight: '700', color: 'var(--accent-purple)' }}>{r.riesgo}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.medida_control}</span>
                                </div>
                                <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(r.id)} style={{ color: 'var(--error-red)' }}>🗑️</button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {mantActiveTab === 'faena_contras' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--primary-color)' }}>Registrar Faena / Contratista</h3>
                        <div className="form-field" style={{ marginBottom: '12px' }}>
                          <label>Tipo de Registro</label>
                          <select
                            value={formFaenaContraCat}
                            onChange={(e) => setFormFaenaContraCat(e.target.value as 'faena' | 'contratista')}
                          >
                            <option value="faena">Faena</option>
                            <option value="contratista">Contratista</option>
                          </select>
                        </div>
                        <div className="form-field" style={{ marginBottom: '15px' }}>
                          <label>Nombre / Valor <span className="required-star">*</span></label>
                          <input
                            type="text"
                            placeholder="Ej. Codelco Andina"
                            value={formFaenaContraVal}
                            onChange={(e) => setFormFaenaContraVal(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ width: '100%' }}
                          onClick={() => handleAddSimpleMantenedor(formFaenaContraCat, formFaenaContraVal, () => setFormFaenaContraVal(''))}
                        >
                          Agregar Elemento
                        </button>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '35px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '15px', color: 'var(--text-main)' }}>Registros Existentes</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {['faena', 'contratista'].map(cat => {
                            const list = mantenedores.filter(m => m.categoria === cat);
                            return (
                              <div key={cat}>
                                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                  {cat === 'faena' ? '📍 Faenas' : '🏢 Contratistas'} ({list.length})
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {list.map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                                      <span style={{ fontWeight: '600' }}>{m.valor}</span>
                                      <button type="button" className="action-icon-btn" onClick={() => handleDeleteMantenedor(m.id)} style={{ color: 'var(--error-red)', padding: '2px' }}>🗑️</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </main>



                {/* MODAL: REALIZAR CHECKLIST DIARIO (WIZARD DE PASOS) */}
                {showChecklistModal && (
                  <div className="modal-overlay" style={{ zIndex: 120, overflowY: 'auto', padding: '20px' }}>
                    <div className="modal-container large" style={{ animation: 'fadeIn 0.3s ease', maxWidth: '850px', width: '100%' }}>
                      <div className="modal-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>assignment_turned_in</span>
                          <h3 style={{ margin: 0 }}>Check List Diario Camión Tanque</h3>
                        </div>
                        <button className="action-icon-btn" onClick={() => setShowChecklistModal(false)} style={{ fontSize: '24px' }}>×</button>
                      </div>

                      {/* Step Tracker */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid var(--card-border)', gap: '10px', overflowX: 'auto' }}>
                        {[
                          { step: 1, label: 'Cabecera' },
                          { step: 2, label: 'Gen. (1-34)' },
                          { step: 3, label: 'Mec. & Auto' },
                          { step: 4, label: 'Equip. (46-62)' },
                          { step: 5, label: 'Doc. & Camión' },
                          { step: 6, label: 'Firmas' }
                        ].map((s) => (
                          <div 
                            key={s.step} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: checklistStep === s.step ? '800' : '500',
                              color: checklistStep === s.step ? 'var(--primary-color)' : checklistStep > s.step ? '#10b981' : '#64748b',
                              borderBottom: checklistStep === s.step ? '2px solid var(--primary-color)' : 'none',
                              paddingBottom: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                background: checklistStep === s.step ? 'var(--primary-color)' : checklistStep > s.step ? '#10b981' : '#cbd5e1', 
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                            >
                              {checklistStep > s.step ? '✓' : s.step}
                            </span>
                            {s.label}
                          </div>
                        ))}
                      </div>

                      <div className="modal-body" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: '20px' }}>
                        {/* Step 1: Cabecera */}
                        {checklistStep === 1 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '14px', fontWeight: '800' }}>1. Información de Cabecera</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                              <div className="form-field">
                                <label>Conductor <span className="required-star">*</span></label>
                                <input type="text" value={checklistForm.conductor} onChange={(e) => setChecklistForm({ ...checklistForm, conductor: e.target.value })} required />
                              </div>
                              <div className="form-field">
                                <label>Patente Camión</label>
                                <input type="text" value={checklistForm.patenteCamion} readOnly style={{ background: '#f1f5f9', fontWeight: 'bold' }} />
                              </div>
                              <div className="form-field">
                                <label>Turno <span className="required-star">*</span></label>
                                <select value={checklistForm.turno} onChange={(e) => setChecklistForm({ ...checklistForm, turno: e.target.value })}>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="Rotativo">Rotativo</option>
                                </select>
                              </div>
                              <div className="form-field">
                                <label>Numeral de Meter <span className="required-star">*</span></label>
                                <input type="text" value={checklistForm.numeralMeter} onChange={(e) => setChecklistForm({ ...checklistForm, numeralMeter: e.target.value })} required />
                              </div>
                              <div className="form-field">
                                <label>Supervisor a Cargo <span className="required-star">*</span></label>
                                <select 
                                  value={checklistForm.supervisorCargo} 
                                  onChange={(e) => setChecklistForm({ ...checklistForm, supervisorCargo: e.target.value })}
                                  required
                                >
                                  <option value="">-- Seleccione Supervisor --</option>
                                  {mantenedores.filter(m => m.categoria === 'supervisor').map(m => (
                                    <option key={m.id} value={m.valor}>{m.valor}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-field">
                                <label>Área Operativa <span className="required-star">*</span></label>
                                <input type="text" value={checklistForm.area} onChange={(e) => setChecklistForm({ ...checklistForm, area: e.target.value })} required />
                              </div>
                              <div className="form-field">
                                <label>Horómetro <span className="required-star">*</span></label>
                                <input type="number" min="0" step="0.1" value={checklistForm.horometro} onChange={(e) => setChecklistForm({ ...checklistForm, horometro: e.target.value })} required />
                              </div>
                              <div className="form-field">
                                <label>Kilometraje <span className="required-star">*</span></label>
                                <input type="number" min="0" value={checklistForm.kilometraje} onChange={(e) => setChecklistForm({ ...checklistForm, kilometraje: e.target.value })} required />
                              </div>
                              <div className="form-field">
                                <label>Vencimiento RT</label>
                                <input type="date" value={checklistForm.vencimientoRT} onChange={(e) => setChecklistForm({ ...checklistForm, vencimientoRT: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>Vencimiento Análisis de Gases</label>
                                <input type="date" value={checklistForm.vencimientoGases} onChange={(e) => setChecklistForm({ ...checklistForm, vencimientoGases: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>Hora Sanitización Equipo</label>
                                <input type="time" value={checklistForm.horaSanitizacion} onChange={(e) => setChecklistForm({ ...checklistForm, horaSanitizacion: e.target.value })} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Steps 2-5: Grids of checklist items */}
                        {checklistStep === 2 && (
                          <ChecklistSectionGrid 
                            title="2. Generalidades (Camión)"
                            items={CHECKLIST_ITEMS.generalidades}
                            stateKey="generalidades"
                            options={['Bueno', 'Malo', 'Observación']}
                            form={checklistForm}
                            setForm={setChecklistForm}
                          />
                        )}

                        {checklistStep === 3 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <ChecklistSectionGrid 
                              title="3. Sistema de Automatización"
                              items={CHECKLIST_ITEMS.sistemaAutomatizacion}
                              stateKey="sistemaAutomatizacion"
                              options={['Bueno', 'Malo', 'Observación']}
                              form={checklistForm}
                              setForm={setChecklistForm}
                            />
                            <ChecklistSectionGrid 
                              title="4. Aspectos Mecánicos"
                              items={CHECKLIST_ITEMS.aspectosMecanicos}
                              stateKey="aspectosMecanicos"
                              options={['Bueno', 'Malo', 'Observación']}
                              form={checklistForm}
                              setForm={setChecklistForm}
                            />
                          </div>
                        )}

                        {checklistStep === 4 && (
                          <ChecklistSectionGrid 
                            title="5. Equipamiento de Seguridad"
                            items={CHECKLIST_ITEMS.equipamiento}
                            stateKey="equipamiento"
                            options={['Bueno', 'Malo', 'Observación']}
                            form={checklistForm}
                            setForm={setChecklistForm}
                          />
                        )}

                        {checklistStep === 5 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <ChecklistSectionGrid 
                              title="6. Documentación Personal del Conductor"
                              items={CHECKLIST_ITEMS.documentacionPersonal}
                              stateKey="documentacionPersonal"
                              options={['Cumple', 'No Cumple', 'Observación']}
                              form={checklistForm}
                              setForm={setChecklistForm}
                            />
                            <ChecklistSectionGrid 
                              title="7. Requisitos Camión Tanque"
                              items={CHECKLIST_ITEMS.camionTanque}
                              stateKey="camionTanque"
                              options={['Cumple', 'No Cumple', 'Observación']}
                              form={checklistForm}
                              setForm={setChecklistForm}
                            />
                          </div>
                        )}

                        {/* Step 6: Observations and signatures */}
                        {checklistStep === 6 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '14px', fontWeight: '800' }}>8. Cierre, Observaciones y Firmas</h4>
                            
                            <div className="form-field">
                              <label>Observaciones Adicionales / Comentarios</label>
                              <textarea 
                                value={checklistForm.observaciones} 
                                onChange={(e) => setChecklistForm({ ...checklistForm, observaciones: e.target.value })} 
                                placeholder="Escriba aquí observaciones sobre fallas encontradas..."
                                rows={3}
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px', fontSize: '13px' }}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
                              <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '15px', background: '#f8fafc' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>Firma Conductor (Ejecutor)</span>
                                <SignaturePad 
                                  value={checklistForm.firmaConductor} 
                                  onChange={(val) => setChecklistForm({ ...checklistForm, firmaConductor: val })}
                                  placeholder="Dibuje aquí firma de Conductor"
                                />
                              </div>
                              <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '15px', background: '#f8fafc' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>Firma Supervisor Autorizador</span>
                                <SignaturePad 
                                  value={checklistForm.firmaSupervisor} 
                                  onChange={(val) => setChecklistForm({ ...checklistForm, firmaSupervisor: val })}
                                  placeholder="Dibuje aquí firma de Supervisor"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Critical Controls Warning Banner */}
                        {checkCriticalControlFailure() && (
                          <div 
                            style={{ 
                              marginTop: '20px', 
                              padding: '12px 16px', 
                              background: '#fef2f2', 
                              border: '1.5px solid #f87171', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              animation: 'pulse 2s infinite'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '24px' }}>warning</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>
                                ADVERTENCIA DE CONTROL CRÍTICO (RC)
                              </span>
                              <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: '600' }}>
                                Se han reportado fallas en un punto crítico de control. El camión tanque quedará en estado RECHAZADO y no podrá salir a faena.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer" style={{ borderTop: '1px solid var(--card-border)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button 
                          type="button"
                          className="btn-secondary" 
                          onClick={() => {
                            if (checklistStep > 1) setChecklistStep(checklistStep - 1);
                            else setShowChecklistModal(false);
                          }}
                        >
                          {checklistStep === 1 ? 'Cancelar' : 'Atrás'}
                        </button>
                        <div>
                          {checklistStep < 6 ? (
                            <button 
                              type="button"
                              className="btn-primary" 
                              onClick={() => {
                                if (checklistStep === 1) {
                                  if (!checklistForm.conductor || !checklistForm.numeralMeter || !checklistForm.supervisorCargo || !checklistForm.area || !checklistForm.horometro || !checklistForm.kilometraje) {
                                    alert('Por favor complete todos los campos obligatorios de la cabecera.');
                                    return;
                                  }
                                }
                                setChecklistStep(checklistStep + 1);
                              }}
                            >
                              Siguiente
                            </button>
                          ) : (
                            <button 
                              type="button"
                              className="btn-primary" 
                              onClick={handleSaveChecklist}
                              style={{ background: checkCriticalControlFailure() ? 'var(--error-red)' : 'var(--success-green)', border: 'none', color: 'white' }}
                            >
                              {checkCriticalControlFailure() ? 'Registrar con Falla RC' : 'Finalizar y Aprobar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL: VER DETALLE DE CHECKLIST COMPLETADO */}
                {selectedChecklistForView && (
                  <div className="modal-overlay" style={{ zIndex: 130, overflowY: 'auto', padding: '20px' }}>
                    <div className="modal-container large" style={{ animation: 'fadeIn 0.3s ease', maxWidth: '850px', width: '100%' }}>
                      <div className="modal-header" style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="material-symbols-outlined" style={{ color: selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? 'var(--success-green)' : 'var(--error-red)' }}>
                            {selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? 'check_circle' : 'cancel'}
                          </span>
                          <h3 style={{ margin: 0 }}>Reporte Check List Diario: {selectedChecklistForView.patenteCamion}</h3>
                        </div>
                        <button className="action-icon-btn" onClick={() => setSelectedChecklistForView(null)} style={{ fontSize: '24px' }}>×</button>
                      </div>

                      <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '20px' }}>
                        {/* Stamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID Checklist: {selectedChecklistForView.id}</span>
                            <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                              Fecha: {new Date(selectedChecklistForView.fecha).toLocaleString('es-CL')}
                            </h4>
                          </div>
                          <div 
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: '800',
                              fontSize: '14px',
                              border: '1.5px solid ' + (selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? 'var(--success-green)' : 'var(--error-red)'),
                              background: selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? 'var(--success-bg)' : 'var(--error-bg)',
                              color: selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? 'var(--success-green)' : 'var(--error-red)'
                            }}
                          >
                            {selectedChecklistForView.estadoCumplimiento === 'APROBADO' ? '✓ TRÁNSITO AUTORIZADO' : '✗ VEHÍCULO RECHAZADO / RETENIDO'}
                          </div>
                        </div>

                        {/* Cabecera Info Grid */}
                        <div className="paper-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                          {[
                            { label: 'Conductor', val: selectedChecklistForView.conductor },
                            { label: 'Patente Camión', val: selectedChecklistForView.patenteCamion },
                            { label: 'Turno', val: selectedChecklistForView.turno },
                            { label: 'Numeral Meter', val: selectedChecklistForView.numeralMeter },
                            { label: 'Supervisor a Cargo', val: selectedChecklistForView.supervisorCargo },
                            { label: 'Área', val: selectedChecklistForView.area },
                            { label: 'Horómetro', val: `${selectedChecklistForView.horometro} hrs` },
                            { label: 'Kilometraje', val: `${selectedChecklistForView.kilometraje} km` },
                            { label: 'Venc. Revisión Técnica', val: selectedChecklistForView.vencimientoRT || 'No registrado' },
                            { label: 'Venc. Análisis Gases', val: selectedChecklistForView.vencimientoGases || 'No registrado' },
                            { label: 'Sanitización Equipo', val: selectedChecklistForView.horaSanitizacion || 'No registrado' }
                          ].map((item, idx) => (
                            <div key={idx} style={{ padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '6px', background: '#f8fafc' }}>
                              <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.label}</span>
                              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)' }}>{item.val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Table detailing failed or observed items */}
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: 'var(--primary-color)' }}>
                          Resumen de Estado de Componentes (1 - 70)
                        </h4>
                        
                        <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                          <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                            <thead>
                              <tr>
                                <th style={{ width: '8%' }}>N°</th>
                                <th style={{ width: '52%' }}>Componente / Documento</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Estado</th>
                                <th style={{ width: '25%' }}>Observación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { catKey: 'generalidades', list: CHECKLIST_ITEMS.generalidades },
                                { catKey: 'sistemaAutomatizacion', list: CHECKLIST_ITEMS.sistemaAutomatizacion },
                                { catKey: 'aspectosMecanicos', list: CHECKLIST_ITEMS.aspectosMecanicos },
                                { catKey: 'equipamiento', list: CHECKLIST_ITEMS.equipamiento },
                                { catKey: 'documentacionPersonal', list: CHECKLIST_ITEMS.documentacionPersonal },
                                { catKey: 'camionTanque', list: CHECKLIST_ITEMS.camionTanque }
                              ].map(({ catKey, list }) => {
                                const parsedCat = JSON.parse(selectedChecklistForView[catKey] || '{}');
                                return list.map((item) => {
                                  const val = parsedCat[item.n] || { estado: '-', obs: '' };
                                  const isFailure = val.estado === 'Malo' || val.estado === 'No Cumple';
                                  
                                  return (
                                    <tr key={item.n} style={{ background: isFailure ? '#fef2f2' : 'transparent' }}>
                                      <td style={{ fontWeight: 'bold' }}>{item.n}</td>
                                      <td style={{ fontWeight: item.rc ? '700' : '400', color: item.rc ? '#b91c1c' : 'inherit' }}>
                                        {item.label}
                                        {item.rc && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '6px', fontSize: '9px', background: '#fef2f2', padding: '1px 3px', borderRadius: '3px', border: '1px solid #f87171' }}>RC</span>}
                                      </td>
                                      <td style={{ textAlign: 'center', fontWeight: '700', color: isFailure ? '#ef4444' : val.estado === 'Bueno' || val.estado === 'Cumple' ? 'var(--success-green)' : '#64748b' }}>
                                        {val.estado}
                                      </td>
                                      <td style={{ fontStyle: val.obs ? 'normal' : 'italic', color: val.obs ? 'var(--text-main)' : '#94a3b8' }}>
                                        {val.obs || '-'}
                                      </td>
                                    </tr>
                                  );
                                });
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Additional observations */}
                        {selectedChecklistForView.observaciones && (
                          <div style={{ padding: '12px 15px', border: '1px solid var(--card-border)', borderRadius: '8px', background: '#fffbeb', marginBottom: '20px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#b45309', fontWeight: '700', marginBottom: '4px' }}>Observaciones del Reporte</span>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#78350f' }}>{selectedChecklistForView.observaciones}</p>
                          </div>
                        )}

                        {/* Signatures */}
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: 'var(--primary-color)' }}>
                          Firmas Registradas
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                          <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', background: '#f8fafc', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Firma Conductor</span>
                            {selectedChecklistForView.firmaConductor ? (
                              <img src={selectedChecklistForView.firmaConductor} alt="Firma Conductor" style={{ maxHeight: '100px', maxWidth: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }} />
                            ) : (
                              <span style={{ fontStyle: 'italic', fontSize: '12px', color: '#94a3b8' }}>Sin firma registrada</span>
                            )}
                          </div>
                          <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', background: '#f8fafc', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Firma Supervisor</span>
                            {selectedChecklistForView.firmaSupervisor ? (
                              <img src={selectedChecklistForView.firmaSupervisor} alt="Firma Supervisor" style={{ maxHeight: '100px', maxWidth: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }} />
                            ) : (
                              <span style={{ fontStyle: 'italic', fontSize: '12px', color: '#94a3b8' }}>Sin firma registrada</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer" style={{ borderTop: '1px solid var(--card-border)', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn-secondary" onClick={() => setSelectedChecklistForView(null)}>Cerrar</button>
                        <button className="btn-primary" onClick={() => window.print()}>🖨️ Imprimir Reporte</button>
                      </div>
                    </div>
                  </div>
                )}

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
                <label>Contraseña de Acceso <span className="required-star">*</span></label>
                <input 
                  type="password" 
                  placeholder="Ingrese nueva contraseña" 
                  value={profilePassword} 
                  onChange={(e) => setProfilePassword(e.target.value)} 
                  required 
                />
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
