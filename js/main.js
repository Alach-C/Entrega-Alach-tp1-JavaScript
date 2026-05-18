// js/main.js
import { CONFIG } from './config.js';
import * as Vistas from './vistas.js';

const ADMIN = { dni: 'profe', password: '1234', esAdmin: true };

let appState = {
    currentUser: null,
    currentView: 'home',
    allAlumnas: [],
    packs: [],
    horarios: [],
    fechaSeleccionada: null,
    calMes: new Date().getMonth(),
    calAnio: new Date().getFullYear(),
    cuposOcupados: {},
    packActivoId: null,
    clasesExtra: [],
    slotsCancelados: [],
    // Registro de asistencias: clave "fechaId-franja-dni" -> "presente" | "ausente"
    asistencias: {}
};

// ─── INIT ────────────────────────────────────────────────────────────────────

async function init() {
    try {
        const [resPacks, resHorarios] = await Promise.all([
            fetch('./data/packs.json'),
            fetch('./data/horarios.json')
        ]);
        appState.packs     = await resPacks.json();
        appState.horarios  = await resHorarios.json();

        const u  = localStorage.getItem('ceramica_usuarios');
        const c  = localStorage.getItem('ceramica_cupos');
        const ce = localStorage.getItem('ceramica_clases_extra');
        const sc = localStorage.getItem('ceramica_slots_cancelados');

        appState.allAlumnas    = u  ? JSON.parse(u)  : [];
        appState.cuposOcupados = c  ? JSON.parse(c)  : {};
        appState.clasesExtra   = ce ? JSON.parse(ce) : [];
        const as = localStorage.getItem('ceramica_asistencias');
        appState.asistencias     = as ? JSON.parse(as) : {};
        appState.slotsCancelados = sc ? JSON.parse(sc) : [];

    } catch (e) {
        appState.packs = [];
        appState.horarios = [];
        appState.allAlumnas = [];
        appState.cuposOcupados = {};
        appState.clasesExtra = [];
        appState.slotsCancelados = [];
    }
    render();
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function render() {
    const app = document.getElementById('app');
    document.body.style.backgroundColor = CONFIG.colores.background;

    switch (appState.currentView) {
        case 'home':
            app.innerHTML = Vistas.homeView();
            vincularHome();
            break;
        case 'login':
            app.innerHTML = Vistas.loginView();
            vincularLogin();
            break;
        case 'register':
            app.innerHTML = Vistas.registerView();
            vincularRegister();
            break;
        case 'dashboard':
            app.innerHTML = Vistas.dashboardView(appState.currentUser);
            vincularDashboard();
            break;
        case 'pagar':
            app.innerHTML = Vistas.pagarView(appState.packs);
            vincularPagar();
            break;
        case 'admin':
            app.innerHTML = Vistas.adminView(
                appState.allAlumnas,
                appState.horarios,
                appState.calAnio,
                appState.calMes,
                appState.clasesExtra,
                appState.slotsCancelados,
                appState.asistencias,
                appState.packs
            );
            vincularAdmin();
            break;
        case 'reservar':
            app.innerHTML = Vistas.reservarView(
                appState.horarios,
                appState.currentUser,
                appState.calAnio,
                appState.calMes,
                appState.cuposOcupados,
                appState.packActivoId,
                appState.clasesExtra,
                appState.slotsCancelados
            );
            vincularReservar();
            break;
    }
    lucide.createIcons();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getPacksActivos(user) {
    if (!user.packsComprados) return [];
    const hoy = new Date();
    return user.packsComprados.filter(pack => {
        const venc = new Date(pack.anio, pack.mes + 1, 0);
        return pack.reservasUsadas < pack.limite && venc >= hoy;
    });
}

function guardarUsuario() {
    const idx = appState.allAlumnas.findIndex(u => u.dni === appState.currentUser.dni);
    appState.allAlumnas[idx] = appState.currentUser;
    localStorage.setItem('ceramica_usuarios', JSON.stringify(appState.allAlumnas));
}

function guardarTodosLosUsuarios() {
    localStorage.setItem('ceramica_usuarios', JSON.stringify(appState.allAlumnas));
}

// ─── VINCULACIÓN: HOME ───────────────────────────────────────────────────────

function vincularHome() {
    document.getElementById('go-login').onclick    = () => { appState.currentView = 'login';    render(); };
    document.getElementById('go-register').onclick = () => { appState.currentView = 'register'; render(); };
}

// ─── VINCULACIÓN: LOGIN ──────────────────────────────────────────────────────

function vincularLogin() {
    document.getElementById('go-home').onclick = () => { appState.currentView = 'home'; render(); };
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const dni  = e.target.dni.value;
        const pass = e.target.password.value;

        if (dni === ADMIN.dni && pass === ADMIN.password) {
            appState.currentUser = ADMIN;
            appState.currentView = 'admin';
            render();
            return;
        }

        const user = appState.allAlumnas.find(u => u.dni === dni && u.password === pass);
        if (user) {
            appState.currentUser = user;
            appState.currentView = 'dashboard';
            render();
        } else {
            const err = document.getElementById('loginError');
            err.innerText = 'Datos incorrectos';
            err.classList.remove('hidden');
        }
    };
}

// ─── VINCULACIÓN: REGISTER ───────────────────────────────────────────────────

function vincularRegister() {
    document.getElementById('go-home-reg').onclick = () => { appState.currentView = 'home'; render(); };
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');

        if (appState.allAlumnas.find(u => u.dni === e.target.dni.value)) {
            const err = document.getElementById('registerError');
            err.innerText = 'Ese DNI ya tiene una cuenta registrada.';
            err.classList.remove('hidden');
            return;
        }

        btn.disabled  = true;
        btn.innerText = 'Guardando...';

        const nuevo = {
            dni:              e.target.dni.value,
            nombre:           e.target.nombre.value,
            apellido:         e.target.apellido.value,
            mail:             e.target.mail.value,
            telefono:         e.target.telefono.value,
            fecha_nacimiento: e.target.fecha_nacimiento.value,
            password:         e.target.password.value,
            packsComprados:   [],
            reservas:         [],
            notificaciones:   []
        };

        appState.allAlumnas.push(nuevo);
        localStorage.setItem('ceramica_usuarios', JSON.stringify(appState.allAlumnas));
        appState.currentUser  = nuevo;
        appState.currentView  = 'dashboard';
        render();
    };
}

// ─── VINCULACIÓN: DASHBOARD ──────────────────────────────────────────────────

function vincularDashboard() {
    document.getElementById('logout').onclick  = () => { appState.currentUser = null; appState.currentView = 'home'; render(); };
    document.getElementById('go-pagar').onclick = () => { appState.currentView = 'pagar'; render(); };

    // Cambiar contraseña
    document.getElementById('btn-cambiar-password').onclick = () => {
        Swal.fire({
            title: 'Cambiar contraseña',
            html: `
                <div style="text-align:left;display:flex;flex-direction:column;gap:8px;margin-top:8px">
                    <div>
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Contraseña actual</label>
                        <input type="password" id="passActual" class="swal2-input" style="margin:0;width:100%" placeholder="Tu contraseña actual">
                    </div>
                    <div>
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nueva contraseña</label>
                        <input type="password" id="passNueva" class="swal2-input" style="margin:0;width:100%" placeholder="Mínimo 4 caracteres">
                    </div>
                    <div>
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Repetir nueva contraseña</label>
                        <input type="password" id="passRepetir" class="swal2-input" style="margin:0;width:100%" placeholder="Repetí la nueva contraseña">
                    </div>
                </div>`,
            confirmButtonText: 'Guardar',
            confirmButtonColor: CONFIG.colores.primary,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: CONFIG.colores.secondary,
            preConfirm: () => {
                const actual   = document.getElementById('passActual').value;
                const nueva    = document.getElementById('passNueva').value;
                const repetir  = document.getElementById('passRepetir').value;
                if (actual !== appState.currentUser.password) {
                    Swal.showValidationMessage('La contraseña actual es incorrecta');
                    return false;
                }
                if (nueva.length < 4) {
                    Swal.showValidationMessage('La nueva contraseña debe tener al menos 4 caracteres');
                    return false;
                }
                if (nueva !== repetir) {
                    Swal.showValidationMessage('Las contraseñas no coinciden');
                    return false;
                }
                return nueva;
            }
        }).then(r => {
            if (!r.isConfirmed) return;
            appState.currentUser.password = r.value;
            guardarUsuario();
            Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                confirmButtonColor: CONFIG.colores.primary,
                timer: 2000,
                showConfirmButton: false
            });
        });
    };

    // Muestra notificaciones pendientes (clases canceladas/reprogramadas)
    const notifs = appState.currentUser.notificaciones || [];
    if (notifs.length > 0) {
        const mensajes = notifs.map(n => `• ${n}`).join('<br>');
        Swal.fire({
            icon: 'info',
            title: 'Novedades del taller',
            html: mensajes,
            confirmButtonText: 'Entendido',
            confirmButtonColor: CONFIG.colores.primary,
        });
        appState.currentUser.notificaciones = [];
        guardarUsuario();
    }

    const packsActivos = getPacksActivos(appState.currentUser);
    const btnReservar  = document.getElementById('go-reservar');

    if (packsActivos.length > 0) {
        btnReservar.removeAttribute('disabled');
        btnReservar.onclick = () => {
            const primerPack          = packsActivos[0];
            appState.packActivoId     = primerPack.id;
            appState.calMes           = primerPack.mes;
            appState.calAnio          = primerPack.anio;
            appState.currentView      = 'reservar';
            render();
        };
    }
}

// ─── VINCULACIÓN: PAGAR ──────────────────────────────────────────────────────

function vincularPagar() {
    document.getElementById('go-dash-pagar').onclick = () => { appState.currentView = 'dashboard'; render(); };

    const selectMes = document.getElementById('selectMes');
    const inputAnio = document.getElementById('inputAnio');
    selectMes.onchange = () => {
        inputAnio.value = selectMes.options[selectMes.selectedIndex].dataset.anio;
    };

    document.getElementById('formNuevoPack').onsubmit = (e) => {
        e.preventDefault();
        const tipoPack   = e.target.tipoPack.value;
        const nombrePack = e.target.nombrePack.value.trim();
        const mesPack    = parseInt(e.target.mesPack.value);
        const anioPack   = parseInt(e.target.anioPack.value);
        const metodo     = e.target.metodo.value;
        if (!tipoPack || !nombrePack || !metodo) return;

        const packInfo = appState.packs.find(p => p.id === tipoPack);

        if (metodo === 'mercadopago') {
            Swal.fire({
                title: 'Mercado Pago',
                html: `<div style="text-align:center">
                    <div style="width:48px;height:48px;border-radius:50%;background:#009ee3;color:#fff;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">MP</div>
                    <p style="font-size:14px;opacity:0.7;margin-bottom:8px">Estás por pagar</p>
                    <p style="font-size:22px;font-weight:bold;margin-bottom:4px">$${packInfo.precio.toLocaleString('es-AR')}</p>
                    <p style="font-size:14px;opacity:0.7">${packInfo.nombre} para <strong>${nombrePack}</strong></p>
                    <hr style="margin:16px 0;opacity:0.2">
                    <p style="font-size:12px;opacity:0.5">Simulación — en producción redigiría a Mercado Pago</p>
                </div>`,
                confirmButtonText: 'Confirmar pago',
                confirmButtonColor: '#009ee3',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                cancelButtonColor: CONFIG.colores.secondary,
            }).then(r => { if (r.isConfirmed) procesarNuevoPack(tipoPack, nombrePack, mesPack, anioPack, metodo, packInfo); });
            return;
        }
        procesarNuevoPack(tipoPack, nombrePack, mesPack, anioPack, metodo, packInfo);
    };
}

function procesarNuevoPack(tipoPack, nombrePack, mesPack, anioPack, metodo, packInfo) {
    const nuevoPack = {
        id:            `pack-${Date.now()}`,
        tipo:          tipoPack,
        nombre:        nombrePack,
        metodo:        metodo,
        mes:           mesPack,
        anio:          anioPack,
        precio:        packInfo.precio,
        limite:        tipoPack === 'pack_4' ? 4 : 1,
        reservasUsadas: 0
    };

    if (!appState.currentUser.packsComprados) appState.currentUser.packsComprados = [];
    if (!appState.currentUser.reservas)        appState.currentUser.reservas = [];

    appState.currentUser.packsComprados.push(nuevoPack);
    guardarUsuario();

    const mesNombre    = new Date(anioPack, mesPack).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const nombreMetodo = metodo === 'mercadopago' ? 'Mercado Pago' : metodo === 'transferencia' ? 'Transferencia' : 'Efectivo en taller';

    Swal.fire({
        icon: 'success',
        title: '¡Pack agregado!',
        html: `<strong>${packInfo.nombre}</strong> para <strong>${nombrePack}</strong><br>
               Válido para: ${mesNombre}<br>Método: ${nombreMetodo}`,
        confirmButtonText: 'Agregar otro pack',
        confirmButtonColor: CONFIG.colores.primary,
        showDenyButton: true,
        denyButtonText: 'Ir al inicio',
        denyButtonColor: CONFIG.colores.secondary,
    }).then(r => { if (r.isDenied) appState.currentView = 'dashboard'; render(); });
}

// ─── VINCULACIÓN: RESERVAR ───────────────────────────────────────────────────

function vincularReservar() {
    document.getElementById('go-dash-res').onclick = () => { appState.currentView = 'dashboard'; render(); };

    function getMesDelPackActivo() {
        const pack = appState.currentUser.packsComprados.find(p => p.id === appState.packActivoId);
        return pack ? { mes: pack.mes, anio: pack.anio } : null;
    }

    document.getElementById('mes-anterior').onclick = () => {
        const mv = getMesDelPackActivo();
        if (!mv) return;
        const prev = appState.calMes === 0 ? 11 : appState.calMes - 1;
        const prevA = appState.calMes === 0 ? appState.calAnio - 1 : appState.calAnio;
        if (prev === mv.mes && prevA === mv.anio) { appState.calMes = prev; appState.calAnio = prevA; render(); }
    };

    document.getElementById('mes-siguiente').onclick = () => {
        const mv = getMesDelPackActivo();
        if (!mv) return;
        const next = appState.calMes === 11 ? 0 : appState.calMes + 1;
        const nextA = appState.calMes === 11 ? appState.calAnio + 1 : appState.calAnio;
        if (next === mv.mes && nextA === mv.anio) { appState.calMes = next; appState.calAnio = nextA; render(); }
    };

    const sel = document.getElementById('selectorPack');
    if (sel) {
        sel.onchange = (e) => {
            appState.packActivoId = e.target.value;
            const pack = appState.currentUser.packsComprados.find(p => p.id === appState.packActivoId);
            if (pack) { appState.calMes = pack.mes; appState.calAnio = pack.anio; }
            render();
        };
    }
}

// ─── VINCULACIÓN: ADMIN ──────────────────────────────────────────────────────

function vincularAdmin() {
    document.getElementById('logout-admin').onclick = () => {
        appState.currentUser = null;
        appState.currentView = 'home';
        render();
    };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.style.background = `${CONFIG.colores.secondary}22`;
                b.style.color = CONFIG.colores.secondary;
                b.classList.add('opacity-60');
            });
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
            btn.style.background = CONFIG.colores.primary;
            btn.style.color = '#fff';
            btn.classList.remove('opacity-60');
        };
    });

    // Navegación de mes en calendario admin
    const btnAnt = document.getElementById('admin-mes-anterior');
    const btnSig = document.getElementById('admin-mes-siguiente');
    if (btnAnt) btnAnt.onclick = () => {
        if (appState.calMes === 0) { appState.calMes = 11; appState.calAnio--; }
        else { appState.calMes--; }
        render();
        setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
    };
    if (btnSig) btnSig.onclick = () => {
        if (appState.calMes === 11) { appState.calMes = 0; appState.calAnio++; }
        else { appState.calMes++; }
        render();
        setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
    };

    // Mostrar/ocultar campo de precio personalizado
    const formExtra = document.getElementById('formClaseExtra');
    if (formExtra) {
        formExtra.querySelectorAll('[name="tipoPrecioExtra"]').forEach(radio => {
            radio.onchange = () => {
                const cont = document.getElementById('precioPersonalizadoContainer');
                cont.classList.toggle('hidden', radio.value !== 'personalizado');
            };
        });

        formExtra.onsubmit = (e) => {
            e.preventDefault();
            const fecha        = e.target.fechaExtra.value;
            const franja       = e.target.franjaExtra.value.trim();
            const nota         = e.target.notaExtra.value.trim();
            const tipoPrecio   = e.target.tipoPrecioExtra.value;
            if (!fecha || !franja) return;

            // Calcula el precio según la opción elegida
            let precio = null;
            let labelPrecio = '';
            if (tipoPrecio === 'personalizado') {
                precio = parseFloat(e.target.precioPersonalizado.value);
                if (!precio || precio <= 0) {
                    Swal.fire({ icon: 'warning', title: 'Ingresá un precio válido', confirmButtonColor: CONFIG.colores.primary });
                    return;
                }
                labelPrecio = `$${precio.toLocaleString('es-AR')} (especial)`;
            } else {
                const packRef = appState.packs.find(p => p.id === tipoPrecio);
                precio = packRef ? packRef.precio : null;
                labelPrecio = tipoPrecio === 'pack_4' ? `$${precio?.toLocaleString('es-AR')} (pack)` : `$${precio?.toLocaleString('es-AR')} (suelta)`;
            }

            const nueva = { id: `extra-${Date.now()}`, fecha, franja, nota, precio, tipoPrecio, labelPrecio };
            appState.clasesExtra.push(nueva);
            localStorage.setItem('ceramica_clases_extra', JSON.stringify(appState.clasesExtra));

            Swal.fire({
                icon: 'success',
                title: '¡Clase extra agregada!',
                html: `${new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} — ${franja}<br>
                       Costo: <strong>${labelPrecio}</strong>`,
                confirmButtonColor: CONFIG.colores.primary,
                timer: 2500,
                showConfirmButton: false
            }).then(() => {
                render();
                setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
            });
        };
    }

    // Alta manual de alumna
    const btnAlta = document.getElementById('btn-alta-manual');
    if (btnAlta) btnAlta.onclick = () => adminAltaManualAlumna();

    // Descarga lista CSV de alumnas
    const btnCSV = document.getElementById('btn-descargar-csv');
    if (btnCSV) {
        btnCSV.onclick = () => {
            const hoy = new Date();
            const filas = [['Nombre', 'Apellido', 'DNI', 'Email', 'Teléfono', 'Fecha nacimiento', 'Edad', 'Packs activos', 'Reservas']];

            appState.allAlumnas
                .filter(u => !u.esAdmin)
                .forEach(u => {
                    const packsActivos = (u.packsComprados || []).filter(p => new Date(p.anio, p.mes + 1, 0) >= hoy).length;
                    let edad = '—';
                    if (u.fecha_nacimiento) {
                        const nac = new Date(u.fecha_nacimiento);
                        edad = hoy.getFullYear() - nac.getFullYear()
                             - (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate()) ? 1 : 0);
                    }
                    filas.push([u.nombre, u.apellido || '', u.dni, u.mail, u.telefono || '—', u.fecha_nacimiento || '—', edad, packsActivos, (u.reservas || []).length]);
                });

            const csv  = filas.map(f => f.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `alumnas_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        };
    }

    // Descarga facturación CSV
    const btnFactCSV = document.getElementById('btn-descargar-facturacion');
    if (btnFactCSV) {
        btnFactCSV.onclick = () => {
            const mesNombre = new Date(appState.calAnio, appState.calMes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
            const filas = [['Alumna', 'Para quién', 'Tipo', 'Método', 'Precio', 'Estado']];

            appState.allAlumnas.filter(u => !u.esAdmin).forEach(u => {
                (u.packsComprados || [])
                    .filter(p => p.mes === appState.calMes && p.anio === appState.calAnio)
                    .forEach(p => {
                        const metodo = p.metodo === 'mercadopago' ? 'Mercado Pago' : p.metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
                        filas.push([`${u.nombre} ${u.apellido || ''}`, p.nombre, p.tipo === 'pack_4' ? 'Pack 4 clases' : 'Clase suelta', metodo, p.precio, p.confirmado ? 'Confirmado' : 'Pendiente']);
                    });
            });

            // Totales usando reduce — método funcional de arrays
            const totales = appState.allAlumnas
                .filter(u => !u.esAdmin)
                .flatMap(u => (u.packsComprados || []).filter(p => p.mes === appState.calMes && p.anio === appState.calAnio))
                .reduce((acc, p) => {
                    acc.total += p.precio;
                    acc[p.metodo] = (acc[p.metodo] || 0) + p.precio;
                    return acc;
                }, { total: 0 });

            filas.push([]);
            filas.push(['RESUMEN', '', '', '', '', '']);
            filas.push(['Mercado Pago', '', '', '', totales.mercadopago || 0, '']);
            filas.push(['Transferencia', '', '', '', totales.transferencia || 0, '']);
            filas.push(['Efectivo', '', '', '', totales.efectivo || 0, '']);
            filas.push(['TOTAL', '', '', '', totales.total, '']);

            const csv  = filas.map(f => f.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facturacion_${mesNombre.replace(/ /g,'_')}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        };
    }
}

// ─── FUNCIONES GLOBALES: RESERVAS ────────────────────────────────────────────

window.appSeleccionarFecha = (fechaId, fechaTexto, diaNumero) => {
    appState.fechaSeleccionada = { id: fechaId, texto: fechaTexto };

    // Obtiene franjas: regulares del día o extras de esa fecha
    const horarioDia   = appState.horarios.find(h => h.dia_numero === diaNumero);
    const franjasExtra = appState.clasesExtra.filter(ce => ce.fecha === fechaId).map(ce => ce.franja);
    const franjas      = horarioDia ? [...new Set([...horarioDia.franjas, ...franjasExtra])] : franjasExtra;

    if (!franjas.length) return;

    const packActivo = appState.currentUser.packsComprados.find(p => p.id === appState.packActivoId);
    if (!packActivo || packActivo.reservasUsadas >= packActivo.limite) {
        Swal.fire({ icon: 'warning', title: 'Sin clases disponibles', text: 'El pack seleccionado no tiene clases disponibles.', confirmButtonColor: CONFIG.colores.primary });
        return;
    }

    const [anioF, mesF] = fechaId.split('-').map(Number);
    if (mesF - 1 !== packActivo.mes || anioF !== packActivo.anio) {
        Swal.fire({ icon: 'warning', title: 'Fecha fuera del mes', text: `Este pack es válido solo para ${new Date(packActivo.anio, packActivo.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}.`, confirmButtonColor: CONFIG.colores.primary });
        return;
    }

    const container = document.getElementById('franjasContainer');
    document.getElementById('franjasTitulo').innerText = `Horarios — ${fechaTexto}`;

    document.getElementById('listadoFranjas').innerHTML = franjas.map(franja => {
        const clave     = `${fechaId}-${franja}`;
        const cancelado = appState.slotsCancelados.includes(clave);
        const ocupados  = appState.cuposOcupados[clave] || 0;
        const sinCupos  = ocupados >= CONFIG.max_cupos;
        const yaReserv  = appState.currentUser.reservas.some(r => r.fecha === fechaId && r.franja === franja && r.packId === appState.packActivoId);
        const bloqueada = cancelado || sinCupos || yaReserv;
        const colorCupos = sinCupos ? '#ef4444' : ocupados >= CONFIG.max_cupos * 0.6 ? '#f59e0b' : CONFIG.colores.secondary;

        return `<button
            class="w-full p-3 rounded-xl border-2 text-left transition ${bloqueada ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}"
            style="border-color:${cancelado ? '#fca5a5' : CONFIG.colores.primary};background:${cancelado ? '#fee2e2' : CONFIG.colores.surface}"
            onclick="window.appConfirmarReserva('${franja}')" ${bloqueada ? 'disabled' : ''}>
            <div class="flex justify-between items-center">
                <span class="font-semibold"><i data-lucide="clock" style="width:15px;height:15px;display:inline;margin-right:5px"></i>${franja}</span>
                <span class="text-sm font-bold" style="color:${cancelado ? '#ef4444' : colorCupos}">
                    ${cancelado ? '✗ Cancelada' : yaReserv ? '✓ Ya reservada' : sinCupos ? 'Sin cupos' : `${ocupados}/${CONFIG.max_cupos} lugares`}
                </span>
            </div>
        </button>`;
    }).join('');

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lucide.createIcons();
};

window.appConfirmarReserva = (franja) => {
    if (!appState.fechaSeleccionada) return;
    const clave    = `${appState.fechaSeleccionada.id}-${franja}`;
    const ocupados = appState.cuposOcupados[clave] || 0;
    if (ocupados >= CONFIG.max_cupos || appState.slotsCancelados.includes(clave)) return;

    const packActivo = appState.currentUser.packsComprados.find(p => p.id === appState.packActivoId);
    if (!packActivo || packActivo.reservasUsadas >= packActivo.limite) return;

    appState.currentUser.reservas.push({
        id:        clave,
        fecha:     appState.fechaSeleccionada.id,
        fechaTexto: appState.fechaSeleccionada.texto,
        franja,
        packId:    appState.packActivoId,
        packNombre: packActivo.nombre
    });
    packActivo.reservasUsadas++;
    guardarUsuario();

    appState.cuposOcupados[clave] = ocupados + 1;
    localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));

    Swal.fire({
        icon: 'success',
        title: '¡Turno reservado!',
        html: `<strong>${appState.fechaSeleccionada.texto}</strong><br>Horario: ${franja}<br>Pack: ${packActivo.nombre}`,
        confirmButtonText: 'Ver mis reservas',
        confirmButtonColor: CONFIG.colores.primary,
    }).then(() => render());
};

window.appCancelarReserva = (reservaId) => {
    Swal.fire({
        title: '¿Cancelar turno?',
        text: 'La clase volverá a estar disponible en tu pack.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: CONFIG.colores.secondary,
    }).then(result => {
        if (!result.isConfirmed) return;
        const reserva = appState.currentUser.reservas.find(r => r.id === reservaId);
        if (reserva) {
            const ocup = appState.cuposOcupados[reservaId] || 0;
            appState.cuposOcupados[reservaId] = Math.max(0, ocup - 1);
            localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
            const pack = appState.currentUser.packsComprados.find(p => p.id === reserva.packId);
            if (pack) pack.reservasUsadas = Math.max(0, pack.reservasUsadas - 1);
        }
        appState.currentUser.reservas = appState.currentUser.reservas.filter(r => r.id !== reservaId);
        guardarUsuario();
        render();
    });
};

// ─── FUNCIONES GLOBALES: ADMIN ───────────────────────────────────────────────

// Elimina un pack de una alumna y libera sus reservas asociadas
window.adminEliminarPack = (dni, packId) => {
    const alumna = appState.allAlumnas.find(u => u.dni === dni);
    if (!alumna) return;

    const pack = (alumna.packsComprados || []).find(p => p.id === packId);
    if (!pack) return;

    const reservasDelPack = (alumna.reservas || []).filter(r => r.packId === packId);

    Swal.fire({
        title: 'Eliminar pack',
        html: `Pack <strong>${pack.nombre}</strong> de <strong>${alumna.nombre} ${alumna.apellido || ''}</strong>
               ${reservasDelPack.length > 0
                   ? `<br><br>Tiene <strong>${reservasDelPack.length} reserva${reservasDelPack.length > 1 ? 's' : ''}</strong> asociada${reservasDelPack.length > 1 ? 's' : ''} que también se eliminarán.`
                   : ''}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar pack',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: CONFIG.colores.secondary,
    }).then(r => {
        if (!r.isConfirmed) return;

        // Libera los cupos de las reservas asociadas al pack
        reservasDelPack.forEach(rv => {
            const ocup = appState.cuposOcupados[rv.id] || 0;
            appState.cuposOcupados[rv.id] = Math.max(0, ocup - 1);
        });
        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));

        // Elimina las reservas del pack y el pack mismo
        alumna.reservas        = (alumna.reservas || []).filter(rv => rv.packId !== packId);
        alumna.packsComprados  = (alumna.packsComprados || []).filter(p => p.id !== packId);

        // Notifica a la alumna
        if (!alumna.notificaciones) alumna.notificaciones = [];
        alumna.notificaciones.push(`Tu pack "${pack.nombre}" fue removido. Contactá al taller para más información.`);

        guardarTodosLosUsuarios();
        render();
    });
};

window.adminConfirmarPago = (dni, packId) => {
    const alumna = appState.allAlumnas.find(u => u.dni === dni);
    const pack   = alumna?.packsComprados?.find(p => p.id === packId);
    if (!pack) return;

    Swal.fire({
        title: '¿Confirmar pago?',
        html: `Pack <strong>${pack.nombre}</strong> de <strong>${alumna.nombre} ${alumna.apellido || ''}</strong>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: CONFIG.colores.primary,
        cancelButtonColor: CONFIG.colores.secondary,
    }).then(r => {
        if (!r.isConfirmed) return;
        pack.confirmado = true;
        guardarTodosLosUsuarios();
        render();
    });
};

window.adminEliminarUsuario = (dni) => {
    const alumna = appState.allAlumnas.find(u => u.dni === dni);
    if (!alumna) return;

    Swal.fire({
        title: '¿Eliminar alumna?',
        html: `Se eliminará a <strong>${alumna.nombre} ${alumna.apellido || ''}</strong> y todas sus reservas.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: CONFIG.colores.secondary,
    }).then(r => {
        if (!r.isConfirmed) return;
        (alumna.reservas || []).forEach(rv => {
            const ocup = appState.cuposOcupados[rv.id] || 0;
            appState.cuposOcupados[rv.id] = Math.max(0, ocup - 1);
        });
        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
        appState.allAlumnas = appState.allAlumnas.filter(u => u.dni !== dni);
        guardarTodosLosUsuarios();
        render();
    });
};

window.adminEditarClaseExtra = (id) => {
    const clase = appState.clasesExtra.find(ce => ce.id === id);
    if (!clase) return;

    Swal.fire({
        title: 'Editar clase extra',
        html: `
            <div style="text-align:left;display:flex;flex-direction:column;gap:10px;margin-top:8px">
                <div>
                    <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Fecha</label>
                    <input type="date" id="editFecha" value="${clase.fecha}" class="swal2-input" style="margin:0;width:100%">
                </div>
                <div>
                    <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Horario</label>
                    <input type="text" id="editFranja" value="${clase.franja}" placeholder="Ej: 17:00 a 19:00" class="swal2-input" style="margin:0;width:100%">
                </div>
                <div>
                    <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nota (opcional)</label>
                    <input type="text" id="editNota" value="${clase.nota || ''}" placeholder="Ej: Clase recuperatoria" class="swal2-input" style="margin:0;width:100%">
                </div>
            </div>`,
        confirmButtonText: 'Guardar cambios',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const fecha  = document.getElementById('editFecha').value;
            const franja = document.getElementById('editFranja').value.trim();
            const nota   = document.getElementById('editNota').value.trim();
            if (!fecha || !franja) { Swal.showValidationMessage('La fecha y el horario son obligatorios'); return false; }
            return { fecha, franja, nota };
        }
    }).then(r => {
        if (!r.isConfirmed) return;
        const idx = appState.clasesExtra.findIndex(ce => ce.id === id);
        appState.clasesExtra[idx] = { ...clase, ...r.value };
        localStorage.setItem('ceramica_clases_extra', JSON.stringify(appState.clasesExtra));
        render();
        setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
    });
};

window.adminEliminarClaseExtra = (id) => {
    appState.clasesExtra = appState.clasesExtra.filter(ce => ce.id !== id);
    localStorage.setItem('ceramica_clases_extra', JSON.stringify(appState.clasesExtra));
    render();
    setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
};

// Cancela un slot completo: libera reservas, notifica alumnas, bloquea el slot
window.adminCancelarClase = (fechaId, franja, fechaTexto) => {
    const clave = `${fechaId}-${franja}`;
    const afectadas = appState.allAlumnas.filter(u =>
        (u.reservas || []).some(r => r.fecha === fechaId && r.franja === franja)
    );

    Swal.fire({
        title: 'Cancelar clase',
        html: `<strong>${fechaTexto} — ${franja}</strong><br><br>
               ${afectadas.length > 0 ? `Hay <strong>${afectadas.length} alumna${afectadas.length > 1 ? 's' : ''}</strong> inscripta${afectadas.length > 1 ? 's' : ''}. Se les notificará y se les devolverá la clase al pack.` : 'No hay alumnas inscriptas en esta clase.'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar clase',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: CONFIG.colores.secondary,
    }).then(r => {
        if (!r.isConfirmed) return;

        // Notifica y libera el pack de cada alumna afectada
        afectadas.forEach(alumna => {
            alumna.reservas = alumna.reservas.filter(rv => !(rv.fecha === fechaId && rv.franja === franja));
            const pack = (alumna.packsComprados || []).find(p => p.reservasUsadas > 0);
            if (pack) pack.reservasUsadas = Math.max(0, pack.reservasUsadas - 1);
            if (!alumna.notificaciones) alumna.notificaciones = [];
            alumna.notificaciones.push(`La clase del ${fechaTexto} a las ${franja} fue cancelada. Tu clase fue devuelta al pack — podés elegir una nueva fecha.`);
        });

        // Bloquea el slot y libera los cupos globales
        appState.slotsCancelados.push(clave);
        appState.cuposOcupados[clave] = 0;
        localStorage.setItem('ceramica_slots_cancelados', JSON.stringify(appState.slotsCancelados));
        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
        guardarTodosLosUsuarios();

        Swal.fire({
            icon: 'success',
            title: 'Clase cancelada',
            text: `Se notificó a ${afectadas.length} alumna${afectadas.length !== 1 ? 's' : ''}.`,
            confirmButtonColor: CONFIG.colores.primary,
            timer: 2500,
            showConfirmButton: false
        }).then(() => {
            render();
            setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
        });
    });
};

// Reprograma un slot: mueve las reservas y notifica a las alumnas
window.adminReprogramarClase = (fechaId, franja, fechaTexto) => {
    Swal.fire({
        title: 'Reprogramar clase',
        html: `<strong>${fechaTexto} — ${franja}</strong>
               <div style="text-align:left;display:flex;flex-direction:column;gap:10px;margin-top:12px">
                   <div>
                       <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nueva fecha</label>
                       <input type="date" id="nuevaFechaInput" class="swal2-input" style="margin:0;width:100%">
                   </div>
                   <div>
                       <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nuevo horario (si cambia)</label>
                       <input type="text" id="nuevaFranjaInput" value="${franja}" placeholder="Ej: 18:00 a 20:00" class="swal2-input" style="margin:0;width:100%">
                   </div>
               </div>`,
        confirmButtonText: 'Reprogramar',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Volver',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const fecha      = document.getElementById('nuevaFechaInput').value;
            const nuevaFranja = document.getElementById('nuevaFranjaInput').value.trim();
            if (!fecha) { Swal.showValidationMessage('Elegí una fecha'); return false; }
            if (!nuevaFranja) { Swal.showValidationMessage('El horario no puede estar vacío'); return false; }
            return { fecha, franja: nuevaFranja };
        }
    }).then(r => {
        if (!r.isConfirmed) return;
        const nuevaFecha      = r.value.fecha;
        const nuevaFranja     = r.value.franja;
        const nuevaFechaObj   = new Date(nuevaFecha + 'T12:00:00');
        const nuevaFechaTexto = nuevaFechaObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        const claveOriginal   = `${fechaId}-${franja}`;
        const claveNueva      = `${nuevaFecha}-${nuevaFranja}`;

        const afectadas = appState.allAlumnas.filter(u =>
            (u.reservas || []).some(rv => rv.fecha === fechaId && rv.franja === franja)
        );

        afectadas.forEach(alumna => {
            alumna.reservas = alumna.reservas.map(rv => {
                if (rv.fecha === fechaId && rv.franja === franja) {
                    return { ...rv, id: claveNueva, fecha: nuevaFecha, fechaTexto: nuevaFechaTexto, franja: nuevaFranja };
                }
                return rv;
            });
            if (!alumna.notificaciones) alumna.notificaciones = [];
            alumna.notificaciones.push(`Tu clase del ${fechaTexto} a las ${franja} fue reprogramada para el ${nuevaFechaTexto} a las ${nuevaFranja}.`);
        });

        const ocupados = appState.cuposOcupados[claveOriginal] || 0;
        appState.cuposOcupados[claveOriginal] = 0;
        appState.cuposOcupados[claveNueva]    = (appState.cuposOcupados[claveNueva] || 0) + ocupados;
        appState.slotsCancelados.push(claveOriginal);

        localStorage.setItem('ceramica_slots_cancelados', JSON.stringify(appState.slotsCancelados));
        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
        guardarTodosLosUsuarios();

        Swal.fire({
            icon: 'success',
            title: '¡Clase reprogramada!',
            html: `Nueva fecha: <strong>${nuevaFechaTexto}</strong><br>Nuevo horario: <strong>${nuevaFranja}</strong><br>Se notificó a ${afectadas.length} alumna${afectadas.length !== 1 ? 's' : ''}.`,
            confirmButtonColor: CONFIG.colores.primary,
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            render();
            setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
        });
    });
};

// Marca asistencia de una alumna en un slot
window.adminMarcarAsistencia = (dni, fechaId, franja, estado) => {
    const clave   = `${fechaId}-${franja}-${dni}`;
    const alumna  = appState.allAlumnas.find(u => u.dni === dni);
    const nombre  = alumna ? `${alumna.nombre} ${alumna.apellido || ''}` : dni;
    const fechaObj = new Date(fechaId + 'T12:00:00');
    const fechaTxt = fechaObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    if (estado === 'ausente' && alumna) {
        Swal.fire({
            title: `${nombre} no vino`,
            html: `¿Querés devolverle la clase al pack para que pueda reprogramar?`,
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Sí, devolver clase',
            denyButtonText: 'No, solo marcar ausente',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            confirmButtonColor: CONFIG.colores.primary,
            denyButtonColor: CONFIG.colores.secondary,
        }).then(r => {
            if (r.isDismissed) return;

            // Marca como ausente
            appState.asistencias[clave] = 'ausente';
            localStorage.setItem('ceramica_asistencias', JSON.stringify(appState.asistencias));

            if (r.isConfirmed) {
                // Devuelve la clase al pack y libera el cupo
                const reserva = (alumna.reservas || []).find(rv => rv.fecha === fechaId && rv.franja === franja);
                if (reserva) {
                    const pack = (alumna.packsComprados || []).find(p => p.id === reserva.packId);
                    if (pack) pack.reservasUsadas = Math.max(0, pack.reservasUsadas - 1);
                    alumna.reservas = alumna.reservas.filter(rv => !(rv.fecha === fechaId && rv.franja === franja));
                    const claveSlot = `${fechaId}-${franja}`;
                    appState.cuposOcupados[claveSlot] = Math.max(0, (appState.cuposOcupados[claveSlot] || 1) - 1);
                    localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
                }
                if (!alumna.notificaciones) alumna.notificaciones = [];
                alumna.notificaciones.push(`Tu clase del ${fechaTxt} a las ${franja} quedó disponible para que puedas elegir una nueva fecha.`);
                guardarTodosLosUsuarios();
            }

            render();
            setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
        });
    } else {
        // Marca presente directamente
        appState.asistencias[clave] = estado;
        localStorage.setItem('ceramica_asistencias', JSON.stringify(appState.asistencias));
        render();
        setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
    }
};

// Reserva un turno para una alumna directamente desde el panel admin
window.adminReservarParaAlumna = (fechaId, franja, fechaTexto) => {
    const claveSlot = `${fechaId}-${franja}`;
    const ocupados  = appState.cuposOcupados[claveSlot] || 0;

    if (ocupados >= CONFIG.max_cupos) {
        Swal.fire({ icon: 'warning', title: 'Sin cupos', text: 'Este turno ya está completo.', confirmButtonColor: CONFIG.colores.primary });
        return;
    }

    const hoy = new Date();

    // Arma opciones de alumnas con sus packs activos para el mes de la fecha
    const [anioF, mesF] = fechaId.split('-').map(Number);
    const mesClase = mesF - 1;

    const opciones = appState.allAlumnas
        .filter(u => !u.esAdmin)
        .map(u => {
            const packsValidos = (u.packsComprados || []).filter(p =>
                p.reservasUsadas < p.limite &&
                new Date(p.anio, p.mes + 1, 0) >= hoy &&
                p.mes === mesClase && p.anio === anioF
            );
            // Solo incluye alumnas que tengan pack para ese mes y no hayan reservado ya ese slot
            const yaReservo = (u.reservas || []).some(r => r.fecha === fechaId && r.franja === franja);
            if (packsValidos.length === 0 || yaReservo) return null;
            return { u, packsValidos };
        })
        .filter(Boolean);

    if (opciones.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin alumnas disponibles',
            html: `No hay alumnas con pack activo para <strong>${new Date(anioF, mesClase).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</strong> que no hayan reservado ya este turno.`,
            confirmButtonColor: CONFIG.colores.primary
        });
        return;
    }

    // Genera el select de alumnas con sus packs
    const opcionesHTML = opciones.map(({ u, packsValidos }) =>
        packsValidos.map(p =>
            `<option value="${u.dni}||${p.id}">${u.nombre} ${u.apellido || ''} — Pack: ${p.nombre} (${p.reservasUsadas}/${p.limite} usadas)</option>`
        ).join('')
    ).join('');

    Swal.fire({
        title: 'Reservar turno para alumna',
        html: `
            <p style="font-size:13px;opacity:0.7;margin-bottom:12px"><strong>${fechaTexto} — ${franja}</strong></p>
            <div style="text-align:left">
                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Alumna y pack</label>
                <select id="selectAlumnaReserva" class="swal2-select" style="width:100%;margin:0">
                    <option value="">Elegir alumna...</option>
                    ${opcionesHTML}
                </select>
            </div>`,
        confirmButtonText: 'Reservar',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const val = document.getElementById('selectAlumnaReserva').value;
            if (!val) { Swal.showValidationMessage('Elegí una alumna'); return false; }
            return val;
        }
    }).then(r => {
        if (!r.isConfirmed) return;

        const [dni, packId] = r.value.split('||');
        const alumna = appState.allAlumnas.find(u => u.dni === dni);
        const pack   = (alumna?.packsComprados || []).find(p => p.id === packId);
        if (!alumna || !pack) return;

        // Crea la reserva
        const nuevaReserva = {
            id:         claveSlot,
            fecha:      fechaId,
            fechaTexto: fechaTexto,
            franja:     franja,
            packId:     packId,
            packNombre: pack.nombre
        };

        if (!alumna.reservas) alumna.reservas = [];
        alumna.reservas.push(nuevaReserva);
        pack.reservasUsadas++;

        // Ocupa el cupo global
        appState.cuposOcupados[claveSlot] = ocupados + 1;
        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));

        // Marca asistencia como presente automáticamente
        const claveAs = `${fechaId}-${franja}-${dni}`;
        appState.asistencias[claveAs] = 'presente';
        localStorage.setItem('ceramica_asistencias', JSON.stringify(appState.asistencias));

        guardarTodosLosUsuarios();

        Swal.fire({
            icon: 'success',
            title: '¡Turno reservado!',
            html: `<strong>${alumna.nombre} ${alumna.apellido || ''}</strong><br>${fechaTexto} — ${franja}`,
            confirmButtonColor: CONFIG.colores.primary,
            timer: 2500,
            showConfirmButton: false
        }).then(() => {
            render();
            setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
        });
    });
};

// Registra manualmente que una alumna vino sin haber reservado
window.adminRegistrarLlegada = (fechaId, franja, fechaTexto) => {
    const opciones = appState.allAlumnas
        .filter(u => !u.esAdmin)
        .map(u => `<option value="${u.dni}">${u.nombre} ${u.apellido || ''} (DNI: ${u.dni})</option>`)
        .join('');

    Swal.fire({
        title: 'Registrar llegada manual',
        html: `
            <p style="font-size:13px;opacity:0.7;margin-bottom:12px">${fechaTexto} — ${franja}</p>
            <div style="text-align:left">
                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Alumna</label>
                <select id="selectAlumnaLlegada" class="swal2-select" style="width:100%;margin:0 0 10px">
                    <option value="">Elegir alumna...</option>
                    ${opciones}
                </select>
                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">¿Descontar del pack?</label>
                <select id="selectDescontarPack" class="swal2-select" style="width:100%;margin:0">
                    <option value="si">Sí, descontar una clase del pack</option>
                    <option value="no">No descontar (clase de cortesía)</option>
                </select>
            </div>`,
        confirmButtonText: 'Registrar',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const dni       = document.getElementById('selectAlumnaLlegada').value;
            const descontar = document.getElementById('selectDescontarPack').value;
            if (!dni) { Swal.showValidationMessage('Elegí una alumna'); return false; }
            return { dni, descontar };
        }
    }).then(r => {
        if (!r.isConfirmed) return;
        const { dni, descontar } = r.value;
        const alumna = appState.allAlumnas.find(u => u.dni === dni);
        if (!alumna) return;

        // Marca asistencia como presente
        const clave = `${fechaId}-${franja}-${dni}`;
        appState.asistencias[clave] = 'presente';
        localStorage.setItem('ceramica_asistencias', JSON.stringify(appState.asistencias));

        if (descontar === 'si') {
            // Descuenta del primer pack activo disponible
            const hoy = new Date();
            const packActivo = (alumna.packsComprados || []).find(p =>
                p.reservasUsadas < p.limite && new Date(p.anio, p.mes + 1, 0) >= hoy
            );
            if (packActivo) {
                packActivo.reservasUsadas++;
                const claveSlot = `${fechaId}-${franja}`;
                appState.cuposOcupados[claveSlot] = (appState.cuposOcupados[claveSlot] || 0) + 1;
                localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
            } else {
                Swal.fire({ icon: 'warning', title: 'Sin pack activo', text: 'La alumna no tiene un pack con clases disponibles. Se registró la asistencia sin descontar.', confirmButtonColor: CONFIG.colores.primary });
            }
        }

        guardarTodosLosUsuarios();
        render();
        setTimeout(() => document.querySelector('[data-tab="calendario"]')?.click(), 10);
    });
};

// La alumna reprograma una reserva propia desde el dashboard
window.alumnaReprogramarReserva = (reservaId, fechaActual, franjaActual, packId) => {
    const pack = appState.currentUser.packsComprados.find(p => p.id === packId);
    if (!pack) return;

    const mesNombre = new Date(pack.anio, pack.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    Swal.fire({
        title: 'Reprogramar turno',
        html: `
            <p style="font-size:13px;opacity:0.7;margin-bottom:12px">Elegí una nueva fecha dentro de <strong>${mesNombre}</strong></p>
            <div style="text-align:left;display:flex;flex-direction:column;gap:8px">
                <div>
                    <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nueva fecha</label>
                    <input type="date" id="nuevaFechaAlumna" class="swal2-input" style="margin:0;width:100%"
                        min="${pack.anio}-${String(pack.mes + 1).padStart(2,'0')}-01"
                        max="${pack.anio}-${String(pack.mes + 1).padStart(2,'0')}-${new Date(pack.anio, pack.mes + 1, 0).getDate()}">
                </div>
                <div>
                    <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">Nuevo horario</label>
                    <select id="nuevaFranjaAlumna" class="swal2-select" style="width:100%;margin:0">
                        ${appState.horarios.flatMap(h => h.franjas).filter((f, i, arr) => arr.indexOf(f) === i).map(f =>
                            `<option value="${f}" ${f === franjaActual ? 'selected' : ''}>${f}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>`,
        confirmButtonText: 'Confirmar cambio',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const fecha  = document.getElementById('nuevaFechaAlumna').value;
            const franja = document.getElementById('nuevaFranjaAlumna').value;
            if (!fecha) { Swal.showValidationMessage('Elegí una fecha'); return false; }

            // Verifica que la nueva fecha esté en el mes del pack
            const [anioF, mesF] = fecha.split('-').map(Number);
            if (mesF - 1 !== pack.mes || anioF !== pack.anio) {
                Swal.showValidationMessage(`Solo podés elegir fechas de ${mesNombre}`);
                return false;
            }
            // Verifica que el nuevo slot tenga cupos
            const claveNueva = `${fecha}-${franja}`;
            if ((appState.cuposOcupados[claveNueva] || 0) >= CONFIG.max_cupos) {
                Swal.showValidationMessage('Ese horario no tiene cupos disponibles');
                return false;
            }
            return { fecha, franja };
        }
    }).then(r => {
        if (!r.isConfirmed) return;

        const nuevaFecha  = r.value.fecha;
        const nuevaFranja = r.value.franja;
        const nuevaFechaTexto = new Date(nuevaFecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        const claveVieja  = reservaId;
        const claveNueva  = `${nuevaFecha}-${nuevaFranja}`;

        // Libera el cupo viejo
        appState.cuposOcupados[claveVieja] = Math.max(0, (appState.cuposOcupados[claveVieja] || 1) - 1);

        // Actualiza la reserva
        const reserva = appState.currentUser.reservas.find(rv => rv.id === reservaId);
        if (reserva) {
            reserva.id        = claveNueva;
            reserva.fecha     = nuevaFecha;
            reserva.fechaTexto = nuevaFechaTexto;
            reserva.franja    = nuevaFranja;
        }

        // Ocupa el cupo nuevo
        appState.cuposOcupados[claveNueva] = (appState.cuposOcupados[claveNueva] || 0) + 1;

        localStorage.setItem('ceramica_cupos', JSON.stringify(appState.cuposOcupados));
        guardarUsuario();

        Swal.fire({
            icon: 'success',
            title: '¡Turno reprogramado!',
            html: `Nueva fecha: <strong class="capitalize">${nuevaFechaTexto}</strong><br>Horario: <strong>${nuevaFranja}</strong>`,
            confirmButtonColor: CONFIG.colores.primary,
            timer: 2500,
            showConfirmButton: false
        }).then(() => render());
    });
};

// Alta manual de alumna desde el panel (para alumnas que no usan la app)
function adminAltaManualAlumna() {
    Swal.fire({
        title: 'Agregar alumna manualmente',
        html: `
            <div style="text-align:left;display:flex;flex-direction:column;gap:8px;margin-top:8px">
                <div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <div>
                        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">Nombre *</label>
                        <input id="altaNombre" class="swal2-input" style="margin:0;width:100%" placeholder="Nombre">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">Apellido</label>
                        <input id="altaApellido" class="swal2-input" style="margin:0;width:100%" placeholder="Apellido">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">DNI *</label>
                    <input id="altaDni" class="swal2-input" style="margin:0;width:100%" placeholder="DNI (se usa como usuario)">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">Teléfono</label>
                    <input id="altaTelefono" class="swal2-input" style="margin:0;width:100%" placeholder="Teléfono">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">Fecha de nacimiento</label>
                    <input id="altaFechaNac" type="date" class="swal2-input" style="margin:0;width:100%">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:3px">Email</label>
                    <input id="altaEmail" type="email" class="swal2-input" style="margin:0;width:100%" placeholder="Email (opcional)">
                </div>
                <p style="font-size:11px;opacity:0.5;margin-top:4px">La contraseña inicial será el DNI. La alumna puede cambiarla al ingresar.</p>
            </div>`,
        confirmButtonText: 'Agregar alumna',
        confirmButtonColor: CONFIG.colores.primary,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: CONFIG.colores.secondary,
        preConfirm: () => {
            const nombre = document.getElementById('altaNombre').value.trim();
            const dni    = document.getElementById('altaDni').value.trim();
            if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
            if (!dni)    { Swal.showValidationMessage('El DNI es obligatorio'); return false; }
            if (appState.allAlumnas.find(u => u.dni === dni)) {
                Swal.showValidationMessage('Ya existe una cuenta con ese DNI');
                return false;
            }
            return {
                nombre,
                apellido:         document.getElementById('altaApellido').value.trim(),
                dni,
                telefono:         document.getElementById('altaTelefono').value.trim(),
                fecha_nacimiento: document.getElementById('altaFechaNac').value,
                mail:             document.getElementById('altaEmail').value.trim(),
            };
        }
    }).then(r => {
        if (!r.isConfirmed) return;
        const nueva = {
            ...r.value,
            password:       r.value.dni, // contraseña inicial = DNI
            packsComprados: [],
            reservas:       [],
            notificaciones: [],
            cargadaManualmente: true
        };
        appState.allAlumnas.push(nueva);
        guardarTodosLosUsuarios();

        Swal.fire({
            icon: 'success',
            title: `¡${nueva.nombre} agregada!`,
            html: `Puede iniciar sesión con DNI <strong>${nueva.dni}</strong> y contraseña <strong>${nueva.dni}</strong>.`,
            confirmButtonColor: CONFIG.colores.primary,
            timer: 3000,
            showConfirmButton: false
        }).then(() => render());
    });
}

init();