// js/vistas.js
import { CONFIG } from './config.js';

// ─── HOME ────────────────────────────────────────────────────────────────────

export const homeView = () => `
  <div class="fade-in w-full max-w-md mx-auto text-center py-12">
    <div class="mb-8">
      <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4" style="background:${CONFIG.colores.primary}">
        <i data-lucide="palette" style="width:48px;height:48px;color:#fff"></i>
      </div>
      <h1 class="text-3xl mb-2">${CONFIG.taller_nombre}</h1>
      <p class="opacity-70">Sistema de turnos y reservas</p>
    </div>
    <div class="space-y-4">
      <button id="go-login" class="w-full py-3 px-6 rounded-xl text-white font-bold text-lg transition hover:opacity-90" style="background:${CONFIG.colores.primary}">Ya tengo cuenta</button>
      <button id="go-register" class="w-full py-3 px-6 rounded-xl font-bold text-lg transition hover:opacity-90 border-2" style="border-color:${CONFIG.colores.secondary};color:${CONFIG.colores.secondary}">Crear cuenta nueva</button>
    </div>
  </div>`;

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export const loginView = () => `
  <div class="fade-in w-full max-w-md mx-auto py-12">
    <button id="go-home" class="flex items-center gap-1 mb-6 opacity-70 hover:opacity-100"><i data-lucide="arrow-left" style="width:18px;height:18px"></i> Volver</button>
    <h2 class="text-2xl mb-6">Iniciar sesión</h2>
    <form id="loginForm" class="space-y-4">
      <div><label class="block text-sm font-semibold mb-1">DNI</label><input name="dni" required class="w-full p-3 rounded-lg border" style="background:${CONFIG.colores.surface}"></div>
      <div><label class="block text-sm font-semibold mb-1">Contraseña</label><input name="password" type="password" required class="w-full p-3 rounded-lg border" style="background:${CONFIG.colores.surface}"></div>
      <div id="loginError" class="text-red-600 text-sm hidden"></div>
      <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-lg" style="background:${CONFIG.colores.primary}">Ingresar</button>
    </form>
  </div>`;

// ─── REGISTER ────────────────────────────────────────────────────────────────

export const registerView = () => `
  <div class="fade-in w-full max-w-md mx-auto py-8">
    <button id="go-home-reg" class="flex items-center gap-1 mb-6 opacity-70 hover:opacity-100"><i data-lucide="arrow-left" style="width:18px;height:18px"></i> Volver</button>
    <h2 class="text-2xl mb-6">Crear cuenta</h2>
    <form id="registerForm" class="space-y-4">
      <div><label class="block text-sm font-semibold mb-1">DNI</label><input name="dni" required class="w-full p-3 rounded-lg border"></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-sm font-semibold mb-1">Nombre</label><input name="nombre" required class="w-full p-3 rounded-lg border"></div>
        <div><label class="block text-sm font-semibold mb-1">Apellido</label><input name="apellido" required class="w-full p-3 rounded-lg border"></div>
      </div>
      <div><label class="block text-sm font-semibold mb-1">Email</label><input name="mail" type="email" required class="w-full p-3 rounded-lg border"></div>
      <div><label class="block text-sm font-semibold mb-1">Teléfono</label><input name="telefono" required placeholder="Ej: 1155667788" class="w-full p-3 rounded-lg border"></div>
      <div><label class="block text-sm font-semibold mb-1">Fecha de nacimiento</label><input name="fecha_nacimiento" type="date" required class="w-full p-3 rounded-lg border"></div>
      <div><label class="block text-sm font-semibold mb-1">Contraseña</label><input name="password" type="password" required minlength="4" class="w-full p-3 rounded-lg border"></div>
      <div id="registerError" class="text-red-600 text-sm hidden"></div>
      <button type="submit" id="registerBtn" class="w-full py-3 rounded-xl text-white font-bold" style="background:${CONFIG.colores.primary}">Crear cuenta</button>
    </form>
  </div>`;

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export const dashboardView = (user) => {
    const packs = user.packsComprados || [];
    const hoy   = new Date();
    const packsActivos  = packs.filter(p => p.reservasUsadas < p.limite && new Date(p.anio, p.mes + 1, 0) >= hoy);
    const packsVencidos = packs.filter(p => new Date(p.anio, p.mes + 1, 0) < hoy);

    return `
    <div class="fade-in w-full max-w-md mx-auto py-8">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl">¡Hola, ${user.nombre}!</h2>
            <div class="flex gap-3 items-center">
                <button id="btn-cambiar-password" class="text-xs opacity-50 hover:opacity-100 underline">Cambiar contraseña</button>
                <button id="logout" class="text-sm opacity-60">Cerrar sesión</button>
            </div>
        </div>

        ${packsActivos.length > 0 ? `
            <div class="mb-4 space-y-2">
                ${packsActivos.map(p => {
                    const mes = new Date(p.anio, p.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                    const met = p.metodo === 'mercadopago' ? 'Mercado Pago' : p.metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
                    const disponibles = p.limite - p.reservasUsadas;
                    return `<div class="p-3 rounded-xl text-sm" style="background:${CONFIG.colores.primary}22;border:1px solid ${CONFIG.colores.primary}44">
                        <div class="flex justify-between font-bold" style="color:${CONFIG.colores.primary}">
                            <span><i data-lucide="check-circle" style="width:14px;height:14px;display:inline;margin-right:4px"></i>${p.nombre}</span>
                            <span>${disponibles} clase${disponibles !== 1 ? 's' : ''} disponible${disponibles !== 1 ? 's' : ''}</span>
                        </div>
                        <p class="opacity-70 mt-0.5">${p.tipo === 'pack_4' ? 'Pack 4 clases' : 'Clase suelta'} · Válido: ${mes} · ${met}</p>
                        <div class="flex gap-1 mt-2">
                            ${Array.from({length: p.limite}, (_, i) => `
                                <span class="inline-block w-4 h-1.5 rounded-full" style="background:${i < p.reservasUsadas ? CONFIG.colores.secondary : CONFIG.colores.primary}"></span>
                            `).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        ` : `<div class="p-3 rounded-xl mb-4 text-sm font-semibold bg-amber-50 text-amber-700">
            <i data-lucide="alert-circle" style="width:15px;height:15px;display:inline;margin-right:5px"></i>
            No tenés packs activos. Abonà para poder reservar.
        </div>`}

        ${packsVencidos.length > 0 ? `
            <div class="mb-4 p-3 rounded-xl text-sm bg-gray-100 text-gray-500">
                <i data-lucide="clock" style="width:14px;height:14px;display:inline;margin-right:4px"></i>
                Tenés ${packsVencidos.length} pack${packsVencidos.length > 1 ? 's' : ''} vencido${packsVencidos.length > 1 ? 's' : ''}
            </div>
        ` : ''}

        <div class="space-y-3">
            <button id="go-pagar" class="w-full py-3 rounded-xl text-white font-bold" style="background:${CONFIG.colores.primary}">
                ${packs.length > 0 ? 'Comprar otro pack' : 'Comprar pack'}
            </button>
            <button id="go-reservar"
                class="w-full py-3 rounded-xl border-2 font-bold transition ${packsActivos.length > 0 ? '' : 'opacity-40 cursor-not-allowed'}"
                style="border-color:${CONFIG.colores.secondary};color:${CONFIG.colores.secondary}"
                ${packsActivos.length > 0 ? '' : 'disabled'}>
                Reservar turno ${packsActivos.length === 0 ? '(comprá un pack primero)' : ''}
            </button>
        </div>

        ${(user.reservas || []).length > 0 ? `
            <div class="mt-6 border-t pt-6">
                <h3 class="text-lg font-bold mb-3">Tus turnos reservados</h3>
                <div class="space-y-2">
                    ${(user.reservas || []).sort((a,b) => a.fecha.localeCompare(b.fecha)).map(r => `
                        <div class="p-3 rounded-xl" style="background:${CONFIG.colores.surface};border:1px solid ${CONFIG.colores.secondary}33">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-semibold capitalize">${r.fechaTexto}</p>
                                    <p class="text-sm opacity-60">${r.franja} · ${r.packNombre}</p>
                                </div>
                                <i data-lucide="calendar-check" style="width:18px;height:18px;color:${CONFIG.colores.primary}"></i>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="window.alumnaReprogramarReserva('${r.id}','${r.fecha}','${r.franja}','${r.packId}')"
                                    class="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 hover:opacity-80 transition"
                                    style="border-color:${CONFIG.colores.secondary};color:${CONFIG.colores.secondary}">
                                    Reprogramar
                                </button>
                                <button onclick="window.appCancelarReserva('${r.id}')"
                                    class="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 hover:opacity-80 transition"
                                    style="border-color:#fca5a5;color:#ef4444">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    </div>`;
};

// ─── PAGAR ───────────────────────────────────────────────────────────────────

export const pagarView = (packs) => {
    const hoy   = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
        const f = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
        return { mes: f.getMonth(), anio: f.getFullYear(), label: f.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) };
    });

    return `
    <div class="fade-in w-full max-w-md mx-auto py-8">
        <button id="go-dash-pagar" class="flex items-center gap-1 mb-6 opacity-70"><i data-lucide="arrow-left" style="width:18px;height:18px"></i> Volver</button>
        <h2 class="text-2xl mb-2">Comprar pack</h2>
        <p class="text-sm opacity-60 mb-6">Podés comprar varios packs, uno por persona o por mes.</p>
        <form id="formNuevoPack" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold mb-1">¿Para quién es?</label>
                <input name="nombrePack" required placeholder="Ej: Ana, Martín, Yo..." class="w-full p-3 rounded-lg border" style="background:${CONFIG.colores.surface}">
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Tipo de pack</label>
                <div class="space-y-2">
                    ${packs.map(pack => `
                        <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer hover:opacity-80 transition" style="border-color:${CONFIG.colores.secondary}66">
                            <input type="radio" name="tipoPack" value="${pack.id}" required>
                            <div>
                                <p class="font-bold">${pack.nombre} — $${pack.precio.toLocaleString('es-AR')}</p>
                                <p class="text-sm opacity-60">${pack.descripcion}</p>
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div>
                <label class="block text-sm font-semibold mb-1">¿Para qué mes?</label>
                <select name="mesPack" id="selectMes" class="w-full p-3 rounded-lg border" style="background:${CONFIG.colores.surface}">
                    ${meses.map((m, i) => `<option value="${m.mes}" data-anio="${m.anio}" ${i === 0 ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
                <input type="hidden" name="anioPack" id="inputAnio" value="${hoy.getFullYear()}">
                <p class="text-xs opacity-60 mt-1">Las clases vencen el último día del mes elegido.</p>
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Método de pago</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:opacity-80" style="border-color:${CONFIG.colores.secondary}66">
                        <input type="radio" name="metodo" value="mercadopago" required>
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs text-white" style="background:#009ee3">MP</div>
                            <span class="font-semibold text-sm">Mercado Pago</span>
                        </div>
                    </label>
                    <label class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:opacity-80" style="border-color:${CONFIG.colores.secondary}66">
                        <input type="radio" name="metodo" value="transferencia">
                        <div class="flex items-center gap-2">
                            <i data-lucide="smartphone" style="width:18px;height:18px;color:${CONFIG.colores.secondary}"></i>
                            <span class="font-semibold text-sm">Transferencia bancaria</span>
                        </div>
                    </label>
                    <label class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer hover:opacity-80" style="border-color:${CONFIG.colores.secondary}66">
                        <input type="radio" name="metodo" value="efectivo">
                        <div class="flex items-center gap-2">
                            <i data-lucide="banknote" style="width:18px;height:18px;color:${CONFIG.colores.secondary}"></i>
                            <span class="font-semibold text-sm">Efectivo en taller</span>
                        </div>
                    </label>
                </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-lg" style="background:${CONFIG.colores.primary}">
                Confirmar compra
            </button>
        </form>
    </div>`;
};

// ─── RESERVAR ────────────────────────────────────────────────────────────────

export const reservarView = (horarios, user, anio, mes, cuposOcupados, packActivoId, clasesExtra, slotsCancelados) => {
    const hoy = new Date();
    const packsActivos = (user.packsComprados || []).filter(p =>
        p.reservasUsadas < p.limite && new Date(p.anio, p.mes + 1, 0) >= hoy
    );

    return `
    <div class="fade-in w-full max-w-lg mx-auto py-8">
        <button id="go-dash-res" class="flex items-center gap-1 mb-6 opacity-70"><i data-lucide="arrow-left" style="width:18px;height:18px"></i> Volver</button>
        <h2 class="text-2xl mb-4">Reservar turno</h2>

        ${packsActivos.length > 1 ? `
            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1">Reservar para:</label>
                <select id="selectorPack" class="w-full p-3 rounded-lg border" style="background:${CONFIG.colores.surface}">
                    ${packsActivos.map(p => `<option value="${p.id}" ${p.id === packActivoId ? 'selected' : ''}>${p.nombre} — ${p.reservasUsadas}/${p.limite} clases usadas</option>`).join('')}
                </select>
            </div>
        ` : packsActivos.length === 1 ? `
            <div class="p-3 rounded-xl mb-4 text-sm font-semibold" style="background:${CONFIG.colores.primary}22;color:${CONFIG.colores.primary}">
                Reservando para: <strong>${packsActivos[0].nombre}</strong> — ${packsActivos[0].reservasUsadas}/${packsActivos[0].limite} clases usadas
            </div>
        ` : ''}

        <div class="flex items-center justify-between mb-4">
            <button id="mes-anterior" class="p-2 rounded-lg hover:opacity-70" style="color:${CONFIG.colores.primary}">
                <i data-lucide="chevron-left" style="width:24px;height:24px"></i>
            </button>
            <h3 class="text-xl font-bold capitalize">
                ${new Date(anio, mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </h3>
            <button id="mes-siguiente" class="p-2 rounded-lg hover:opacity-70" style="color:${CONFIG.colores.primary}">
                <i data-lucide="chevron-right" style="width:24px;height:24px"></i>
            </button>
        </div>

        <div class="flex gap-4 text-xs mb-3 opacity-70">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm" style="background:${CONFIG.colores.primary}22;border:1.5px solid ${CONFIG.colores.primary}"></span>Con cupos</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-red-200"></span>Sin cupos / Cancelada</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm" style="background:#fef9c3;border:1.5px dashed #ca8a04"></span>Clase extra</span>
        </div>

        <div class="rounded-2xl overflow-hidden border" style="border-color:${CONFIG.colores.secondary}33">
            <div class="grid grid-cols-7 text-center text-xs font-bold py-2" style="background:${CONFIG.colores.secondary};color:#fff">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
            </div>
            <div class="grid grid-cols-7" style="background:${CONFIG.colores.surface}">
                ${generarCeldasCalendario(anio, mes, horarios, user.reservas || [], cuposOcupados, clasesExtra, slotsCancelados)}
            </div>
        </div>

        <div id="franjasContainer" class="hidden mt-6">
            <h3 class="text-lg font-bold mb-3" id="franjasTitulo"></h3>
            <div id="listadoFranjas" class="space-y-2"></div>
        </div>

        ${(user.reservas || []).length > 0 ? `
            <div class="mt-8 border-t pt-6">
                <h3 class="text-lg font-bold mb-3">Tus reservas</h3>
                <div class="space-y-2">
                    ${user.reservas.map(r => `
                        <div class="flex justify-between items-center p-3 rounded-xl" style="background:${CONFIG.colores.surface};border:1px solid ${CONFIG.colores.secondary}33">
                            <div>
                                <p class="font-semibold capitalize">${r.fechaTexto}</p>
                                <p class="text-sm opacity-60">${r.franja} · ${r.packNombre}</p>
                            </div>
                            <button onclick="window.appCancelarReserva('${r.id}')" class="text-red-400 text-sm hover:text-red-600">Cancelar</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    </div>`;
};

function generarCeldasCalendario(anio, mes, horarios, reservas, cuposOcupados, clasesExtra, slotsCancelados) {
    const diasTaller = horarios.map(h => h.dia_numero);
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const inicio    = primerDia.getDay();
    let celdas = '';

    for (let i = 0; i < inicio; i++) celdas += `<div class="aspect-square p-1"></div>`;

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const fecha    = new Date(anio, mes, dia); fecha.setHours(0,0,0,0);
        const diaSem   = fecha.getDay();
        const esTaller = diasTaller.includes(diaSem);
        const esPasado = fecha < hoy;
        const fechaId  = fecha.toISOString().split('T')[0];

        // Verifica clases extra para este día
        const extrasDelDia = (clasesExtra || []).filter(ce => ce.fecha === fechaId);
        const esExtra      = extrasDelDia.length > 0;

        if ((esTaller || esExtra) && !esPasado) {
            const horarioDia   = horarios.find(h => h.dia_numero === diaSem) || { franjas: [] };
            const franjasExtra = extrasDelDia.map(ce => ce.franja);
            const todasFranjas = [...new Set([...horarioDia.franjas, ...franjasExtra])];

            const algunaLibre = todasFranjas.some(fr => {
                const clave = `${fechaId}-${fr}`;
                return (cuposOcupados[clave] || 0) < CONFIG.max_cupos && !(slotsCancelados || []).includes(clave);
            });
            const tieneReserva = reservas.some(r => r.fecha === fechaId);

            const bgColor     = !esTaller && esExtra ? '#fef9c3' : algunaLibre ? CONFIG.colores.primary + '22' : '#fee2e2';
            const borderColor = !esTaller && esExtra ? '#ca8a04' : algunaLibre ? CONFIG.colores.primary : '#fca5a5';
            const borderStyle = !esTaller && esExtra ? 'dashed' : 'solid';
            const textColor   = !esTaller && esExtra ? '#92400e' : algunaLibre ? CONFIG.colores.primary : '#ef4444';

            celdas += `
              <div onclick="${algunaLibre ? `window.appSeleccionarFecha('${fechaId}','${fecha.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}',${diaSem})` : ''}"
                class="aspect-square flex flex-col items-center justify-center rounded-lg m-0.5 transition relative ${algunaLibre ? 'cursor-pointer hover:opacity-75' : 'cursor-not-allowed'}"
                style="background:${bgColor};border:1.5px ${borderStyle} ${borderColor}">
                <span class="font-bold text-sm leading-none" style="color:${textColor}">${dia}</span>
                ${tieneReserva ? `<span class="w-1.5 h-1.5 rounded-full mt-1" style="background:${CONFIG.colores.primary}"></span>` : ''}
              </div>`;
        } else {
            celdas += `<div class="aspect-square flex items-center justify-center m-0.5 rounded-lg opacity-25"><span class="text-sm">${dia}</span></div>`;
        }
    }
    return celdas;
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

function calcularEdad(fechaNac) {
    if (!fechaNac) return '—';
    const hoy = new Date(); const nac = new Date(fechaNac);
    let e = hoy.getFullYear() - nac.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) e--;
    return e;
}

export const adminView = (alumnas, horarios, calAnio, calMes, clasesExtra, slotsCancelados, asistencias, packs) => {
    const hoy      = new Date();
    const usuarios = alumnas.filter(u => !u.esAdmin);

    // Resumen — 
    const totalPagos = usuarios.reduce((acc, u) => {
        (u.packsComprados || []).forEach(p => { if (!p.confirmado) acc++; });
        return acc;
    }, 0);
    const totalReservas = usuarios.reduce((acc, u) => acc + (u.reservas || []).length, 0);

    // Mapa de reservas para el calendario: clave → [nombres]
    const reservasPorSlot = {};
    usuarios.forEach(u => {
        (u.reservas || []).forEach(r => {
            const k = `${r.fecha}||${r.franja}`;
            if (!reservasPorSlot[k]) reservasPorSlot[k] = [];
            reservasPorSlot[k].push(`${u.nombre} ${u.apellido || ''}`);
        });
    });

    // Días del taller + clases extra del mes
    const diasTaller = (horarios || []).map(h => h.dia_numero);
    const diasDelMes = [];
    const ultimo = new Date(calAnio, calMes + 1, 0).getDate();
    for (let d = 1; d <= ultimo; d++) {
        const fecha  = new Date(calAnio, calMes, d);
        const fechaId = fecha.toISOString().split('T')[0];
        const extrasDelDia = (clasesExtra || []).filter(ce => ce.fecha === fechaId);
        if (diasTaller.includes(fecha.getDay()) || extrasDelDia.length > 0) {
            diasDelMes.push({ fecha, fechaId, extrasDelDia });
        }
    }

    // Facturación — reduce para calcular totales
    const factura = usuarios
        .flatMap(u => (u.packsComprados || []).filter(p => p.mes === calMes && p.anio === calAnio))
        .reduce((acc, p) => {
            acc.total += p.precio;
            acc[p.metodo] = (acc[p.metodo] || 0) + p.precio;
            return acc;
        }, { total: 0, mercadopago: 0, transferencia: 0, efectivo: 0 });

    const mesNombre = new Date(calAnio, calMes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    return `
    <div class="fade-in w-full max-w-3xl mx-auto py-8 px-2">

        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl">Panel de profesora</h2>
            <button id="logout-admin" class="text-sm opacity-60">Cerrar sesión</button>
        </div>

        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="p-4 rounded-xl text-center" style="background:${CONFIG.colores.primary}22">
                <p class="text-2xl font-bold" style="color:${CONFIG.colores.primary}">${usuarios.length}</p>
                <p class="text-xs opacity-70">Alumnas</p>
            </div>
            <div class="p-4 rounded-xl text-center" style="background:${CONFIG.colores.primary}22">
                <p class="text-2xl font-bold" style="color:${CONFIG.colores.primary}">${totalPagos}</p>
                <p class="text-xs opacity-70">Pagos pendientes</p>
            </div>
            <div class="p-4 rounded-xl text-center" style="background:${CONFIG.colores.primary}22">
                <p class="text-2xl font-bold" style="color:${CONFIG.colores.primary}">${totalReservas}</p>
                <p class="text-xs opacity-70">Reservas activas</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b" style="border-color:${CONFIG.colores.secondary}33">
            <button class="tab-btn px-4 py-2 font-bold text-sm rounded-t-lg" data-tab="alumnas" style="background:${CONFIG.colores.primary};color:#fff">Alumnas</button>
            <button class="tab-btn px-4 py-2 font-bold text-sm rounded-t-lg opacity-60" data-tab="calendario" style="background:${CONFIG.colores.secondary}22;color:${CONFIG.colores.secondary}">Calendario</button>
            <button class="tab-btn px-4 py-2 font-bold text-sm rounded-t-lg opacity-60" data-tab="facturacion" style="background:${CONFIG.colores.secondary}22;color:${CONFIG.colores.secondary}">Facturación</button>
        </div>

        <!-- TAB ALUMNAS -->
        <div id="tab-alumnas" class="tab-content">
            <div class="flex justify-between items-center mb-4">
                <p class="text-sm opacity-60">${usuarios.length} alumna${usuarios.length !== 1 ? 's' : ''}</p>
                <div class="flex gap-2">
                    <button id="btn-alta-manual" class="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-80" style="background:${CONFIG.colores.primary}">
                        <i data-lucide="user-plus" style="width:15px;height:15px"></i> Agregar alumna
                    </button>
                    <button id="btn-descargar-csv" class="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-80" style="background:${CONFIG.colores.secondary}">
                        <i data-lucide="download" style="width:15px;height:15px"></i> Descargar lista
                    </button>
                </div>
            </div>

            ${usuarios.length === 0
                ? `<div class="p-6 text-center opacity-50 rounded-xl border">No hay alumnas registradas todavía.</div>`
                : usuarios.map(u => {
                    const edad = calcularEdad(u.fecha_nacimiento);
                    const fechaNacFmt = u.fecha_nacimiento ? new Date(u.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-AR') : '—';
                    const packsActivos = (u.packsComprados || []).filter(p => new Date(p.anio, p.mes + 1, 0) >= hoy);

                    return `
                    <div class="mb-4 rounded-2xl border overflow-hidden" style="border-color:${CONFIG.colores.secondary}33">
                        <div class="flex justify-between items-start p-4" style="background:${CONFIG.colores.surface}">
                            <div>
                                <p class="font-bold">${u.nombre} ${u.apellido || ''}</p>
                                <div class="text-sm opacity-60 mt-1 space-y-0.5">
                                    <p><i data-lucide="credit-card" style="width:12px;height:12px;display:inline;margin-right:4px"></i>DNI: ${u.dni}</p>
                                    <p><i data-lucide="mail" style="width:12px;height:12px;display:inline;margin-right:4px"></i>${u.mail}</p>
                                    <p><i data-lucide="phone" style="width:12px;height:12px;display:inline;margin-right:4px"></i>${u.telefono || '—'}</p>
                                    <p><i data-lucide="cake" style="width:12px;height:12px;display:inline;margin-right:4px"></i>${fechaNacFmt} · ${edad} años</p>
                                </div>
                            </div>
                            <button onclick="window.adminEliminarUsuario('${u.dni}')" class="text-red-400 hover:text-red-600 text-sm font-semibold ml-4">Eliminar</button>
                        </div>
                        ${packsActivos.length > 0 ? `
                            <div class="p-4 space-y-2" style="background:${CONFIG.colores.background}">
                                <p class="text-xs font-bold opacity-50 uppercase tracking-wide">Packs</p>
                                ${packsActivos.map(p => {
                                    const mn = new Date(p.anio, p.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                                    const mt = p.metodo === 'mercadopago' ? 'Mercado Pago' : p.metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
                                    return `<div class="flex justify-between items-center p-3 rounded-xl" style="background:${CONFIG.colores.surface}">
                                        <div>
                                            <p class="font-semibold text-sm">${p.nombre} — ${p.tipo === 'pack_4' ? 'Pack 4 clases' : 'Clase suelta'}</p>
                                            <p class="text-xs opacity-60">${mn} · ${p.reservasUsadas}/${p.limite} clases · ${mt}</p>
                                        </div>
                                        ${p.confirmado
                                            ? `<span class="text-xs font-bold px-2 py-1 rounded-full" style="background:#d1fae5;color:#065f46">✓ Confirmado</span>`
                                            : `<button onclick="window.adminConfirmarPago('${u.dni}','${p.id}')" class="text-xs font-bold px-2 py-1 rounded-full hover:opacity-80" style="background:${CONFIG.colores.primary}22;color:${CONFIG.colores.primary}">Confirmar pago</button>`}
                                        <button onclick="window.adminEliminarPack('${u.dni}','${p.id}')" class="text-xs font-bold px-2 py-1 rounded-full hover:opacity-80 text-red-400 border border-red-200">Eliminar pack</button>
                                    </div>`;
                                }).join('')}
                            </div>
                        ` : `<div class="p-3 text-sm opacity-50 text-center" style="background:${CONFIG.colores.background}">Sin packs activos</div>`}
                    </div>`;
                }).join('')}
        </div>

        <!-- TAB CALENDARIO -->
        <div id="tab-calendario" class="tab-content hidden">

            <div class="flex items-center justify-between mb-4">
                <button id="admin-mes-anterior" class="p-2 rounded-lg hover:opacity-70" style="color:${CONFIG.colores.primary}">
                    <i data-lucide="chevron-left" style="width:24px;height:24px"></i>
                </button>
                <h3 class="text-xl font-bold capitalize">${mesNombre}</h3>
                <button id="admin-mes-siguiente" class="p-2 rounded-lg hover:opacity-70" style="color:${CONFIG.colores.primary}">
                    <i data-lucide="chevron-right" style="width:24px;height:24px"></i>
                </button>
            </div>

            <!-- Agregar clase extra -->
            <div class="mb-6 p-4 rounded-2xl border" style="border-color:${CONFIG.colores.secondary}33;background:${CONFIG.colores.surface}">
                <p class="font-bold mb-3 text-sm">Agregar clase extra</p>
                <form id="formClaseExtra" class="flex gap-2 flex-wrap">
                    <input type="date" name="fechaExtra" required class="flex-1 p-2 rounded-lg border text-sm" style="min-width:140px">
                    <input type="text" name="franjaExtra" required placeholder="Ej: 17:00 a 19:00" class="flex-1 p-2 rounded-lg border text-sm" style="min-width:140px">
                    <input type="text" name="notaExtra" placeholder="Nota (opcional): Ej: Clase recuperatoria" class="w-full p-2 rounded-lg border text-sm">
                    <div class="w-full">
                        <label class="block text-xs font-semibold mb-1 opacity-60">Costo de la clase</label>
                        <div class="flex gap-2 flex-wrap">
                            <label class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:opacity-80 text-sm flex-1" style="border-color:${CONFIG.colores.secondary}44">
                                <input type="radio" name="tipoPrecioExtra" value="pack_4" checked> Igual al pack (${packs.find(p=>p.id==='pack_4') ? '$'+packs.find(p=>p.id==='pack_4').precio.toLocaleString('es-AR') : ''})
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:opacity-80 text-sm flex-1" style="border-color:${CONFIG.colores.secondary}44">
                                <input type="radio" name="tipoPrecioExtra" value="suelta"> Clase suelta (${packs.find(p=>p.id==='suelta') ? '$'+packs.find(p=>p.id==='suelta').precio.toLocaleString('es-AR') : ''})
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:opacity-80 text-sm flex-1" style="border-color:${CONFIG.colores.secondary}44">
                                <input type="radio" name="tipoPrecioExtra" value="personalizado"> Precio especial
                            </label>
                        </div>
                        <div id="precioPersonalizadoContainer" class="hidden mt-2">
                            <input type="number" name="precioPersonalizado" placeholder="Ingresá el precio" class="w-full p-2 rounded-lg border text-sm" min="0">
                        </div>
                    </div>
                    <button type="submit" class="w-full px-4 py-2 rounded-lg text-white font-bold text-sm hover:opacity-80" style="background:${CONFIG.colores.primary}">Agregar clase extra</button>
                </form>
            </div>

            <!-- Clases extra existentes -->
            ${(clasesExtra || []).length > 0 ? `
                <div class="mb-4 p-3 rounded-xl border" style="border-color:#ca8a0444;background:#fef9c3">
                    <p class="text-xs font-bold opacity-60 uppercase tracking-wide mb-2">Clases extra programadas</p>
                    ${(clasesExtra || []).map(ce => `
                        <div class="flex justify-between items-start py-2 border-b last:border-0" style="border-color:#ca8a0422">
                            <div>
                                <p class="text-sm capitalize font-semibold">${new Date(ce.fecha + 'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})} — ${ce.franja}</p>
                                ${ce.nota ? `<p class="text-xs opacity-60 mt-0.5">📝 ${ce.nota}</p>` : ''}
                                ${ce.labelPrecio ? `<p class="text-xs font-bold mt-0.5" style="color:#92400e">💰 ${ce.labelPrecio}</p>` : ''}
                            </div>
                            <div class="flex gap-2 ml-2 shrink-0">
                                <button onclick="window.adminEditarClaseExtra('${ce.id}')" class="text-xs font-bold px-2 py-0.5 rounded-full hover:opacity-80" style="background:${CONFIG.colores.secondary}22;color:${CONFIG.colores.secondary}">Editar</button>
                                <button onclick="window.adminEliminarClaseExtra('${ce.id}')" class="text-xs font-bold px-2 py-0.5 rounded-full hover:opacity-80 text-red-400">Eliminar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Días del mes con reservas -->
            ${diasDelMes.length === 0
                ? `<p class="text-center opacity-50 py-8">No hay días de taller en este mes.</p>`
                : diasDelMes.map(({ fecha, fechaId, extrasDelDia }) => {
                    const horarioDia   = (horarios || []).find(h => h.dia_numero === fecha.getDay()) || { franjas: [] };
                    const franjasExtra = extrasDelDia.map(ce => ce.franja);
                    const todasFranjas = [...new Set([...horarioDia.franjas, ...franjasExtra])];
                    const fechaTexto   = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                    const esExtra      = extrasDelDia.length > 0 && !horarioDia.franjas.length;

                    return `
                    <div class="mb-4 rounded-2xl overflow-hidden border" style="border-color:${esExtra ? '#ca8a04' : CONFIG.colores.secondary}33">
                        <div class="px-4 py-3 font-bold capitalize text-white flex justify-between items-center"
                             style="background:${esExtra ? '#92400e' : CONFIG.colores.secondary}">
                            <span>${fechaTexto} ${esExtra ? '⭐ Extra' : ''}</span>
                        </div>
                        <div class="divide-y" style="background:${CONFIG.colores.surface}">
                            ${todasFranjas.map(franja => {
                                const clave     = `${fechaId}-${franja}`;
                                const cancelado = (slotsCancelados || []).includes(clave);
                                const inscritos = reservasPorSlot[`${fechaId}||${franja}`] || [];

                                return `
                                <div class="p-3 ${cancelado ? 'opacity-50' : ''}">
                                    <div class="flex justify-between items-center mb-1 flex-wrap gap-2">
                                        <p class="font-semibold text-sm">${franja} ${cancelado ? '<span class="text-red-500 text-xs">✗ Cancelada</span>' : ''}</p>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                                                  style="background:${inscritos.length >= CONFIG.max_cupos ? '#fee2e2' : CONFIG.colores.primary + '22'};
                                                         color:${inscritos.length >= CONFIG.max_cupos ? '#ef4444' : CONFIG.colores.primary}">
                                                ${inscritos.length}/${CONFIG.max_cupos}
                                            </span>
                                            ${!cancelado ? `
                                                <button onclick="window.adminCancelarClase('${fechaId}','${franja}','${fechaTexto}')"
                                                    class="text-xs px-2 py-0.5 rounded-full font-bold hover:opacity-80 text-white" style="background:#ef4444">
                                                    Cancelar
                                                </button>
                                                <button onclick="window.adminReprogramarClase('${fechaId}','${franja}','${fechaTexto}')"
                                                    class="text-xs px-2 py-0.5 rounded-full font-bold hover:opacity-80 text-white" style="background:${CONFIG.colores.secondary}">
                                                    Reprogramar
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    ${inscritos.length > 0 ? `
                                        <div class="space-y-1 mt-2">
                                            ${inscritos.map(nombre => {
                                                // Busca el DNI de la alumna por nombre
                                                const alumna = usuarios.find(u => `${u.nombre} ${u.apellido || ''}`.trim() === nombre.trim());
                                                const dni    = alumna ? alumna.dni : null;
                                                const claveAs = dni ? `${fechaId}-${franja}-${dni}` : null;
                                                const estado  = claveAs ? (asistencias || {})[claveAs] : null;

                                                return `
                                                <div class="flex justify-between items-center py-1 px-2 rounded-lg" style="background:${estado === 'presente' ? '#d1fae5' : estado === 'ausente' ? '#fee2e2' : CONFIG.colores.secondary + '11'}">
                                                    <span class="text-sm capitalize font-semibold">${nombre.trim()}</span>
                                                    <div class="flex gap-1">
                                                        ${estado ? `
                                                            <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:${estado === 'presente' ? '#d1fae5' : '#fee2e2'};color:${estado === 'presente' ? '#065f46' : '#991b1b'}">
                                                                ${estado === 'presente' ? '✓ Presente' : '✗ Ausente'}
                                                            </span>
                                                            ${dni ? `<button onclick="window.adminMarcarAsistencia('${dni}','${fechaId}','${franja}','${estado === 'presente' ? 'ausente' : 'presente'}')" class="text-xs opacity-50 hover:opacity-100 px-1">↩</button>` : ''}
                                                        ` : `
                                                            ${dni ? `
                                                                <button onclick="window.adminMarcarAsistencia('${dni}','${fechaId}','${franja}','presente')" class="text-xs font-bold px-2 py-0.5 rounded-full hover:opacity-80 text-white" style="background:#10b981">✓</button>
                                                                <button onclick="window.adminMarcarAsistencia('${dni}','${fechaId}','${franja}','ausente')" class="text-xs font-bold px-2 py-0.5 rounded-full hover:opacity-80 text-white" style="background:#ef4444">✗</button>
                                                            ` : `<span class="text-xs opacity-40">${nombre.trim()}</span>`}
                                                        `}
                                                    </div>
                                                </div>`;
                                            }).join('')}
                                        </div>
                                    ` : `<p class="text-xs opacity-40 mt-1">Sin inscriptos</p>`}
                                    <button onclick="window.adminRegistrarLlegada('${fechaId}','${franja}','${fechaTexto}')"
                                        class="mt-1 text-xs font-bold px-3 py-1 rounded-full hover:opacity-80 w-full text-center"
                                        style="background:${CONFIG.colores.secondary}22;color:${CONFIG.colores.secondary}">
                                        + Registrar llegada (sin reserva)
                                    </button>
                                    <button onclick="window.adminReservarParaAlumna('${fechaId}','${franja}','${fechaTexto}')"
                                        class="mt-1 text-xs font-bold px-3 py-1 rounded-full hover:opacity-80 w-full text-center text-white"
                                        style="background:${CONFIG.colores.primary}">
                                        + Reservar turno para alumna
                                    </button>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`;
                }).join('')}
        </div>

        <!-- TAB FACTURACIÓN -->
        <div id="tab-facturacion" class="tab-content hidden">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold capitalize">Ingresos de ${mesNombre}</h3>
                <button id="btn-descargar-facturacion" class="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-80" style="background:${CONFIG.colores.secondary}">
                    <i data-lucide="download" style="width:15px;height:15px"></i> Descargar
                </button>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="p-4 rounded-xl text-center border" style="border-color:#009ee333;background:#009ee311">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white mx-auto mb-2" style="background:#009ee3">MP</div>
                    <p class="text-lg font-bold">$${factura.mercadopago.toLocaleString('es-AR')}</p>
                    <p class="text-xs opacity-60">Mercado Pago</p>
                </div>
                <div class="p-4 rounded-xl text-center border" style="border-color:${CONFIG.colores.primary}33;background:${CONFIG.colores.primary}11">
                    <i data-lucide="smartphone" style="width:24px;height:24px;margin:0 auto 8px;display:block;color:${CONFIG.colores.primary}"></i>
                    <p class="text-lg font-bold">$${factura.transferencia.toLocaleString('es-AR')}</p>
                    <p class="text-xs opacity-60">Transferencia</p>
                </div>
                <div class="p-4 rounded-xl text-center border" style="border-color:${CONFIG.colores.secondary}33;background:${CONFIG.colores.secondary}11">
                    <i data-lucide="banknote" style="width:24px;height:24px;margin:0 auto 8px;display:block;color:${CONFIG.colores.secondary}"></i>
                    <p class="text-lg font-bold">$${factura.efectivo.toLocaleString('es-AR')}</p>
                    <p class="text-xs opacity-60">Efectivo</p>
                </div>
            </div>

            <div class="p-4 rounded-xl font-bold flex justify-between text-white mb-6" style="background:${CONFIG.colores.primary}">
                <span>Total del mes</span>
                <span>$${factura.total.toLocaleString('es-AR')}</span>
            </div>

            <p class="text-xs font-bold opacity-50 uppercase tracking-wide mb-3">Detalle de ventas</p>
            ${(() => {
                const ventas = usuarios.flatMap(u =>
                    (u.packsComprados || [])
                        .filter(p => p.mes === calMes && p.anio === calAnio)
                        .map(p => ({ alumna: `${u.nombre} ${u.apellido || ''}`, pack: p }))
                );
                if (!ventas.length) return `<p class="text-center opacity-40 py-4">No hay ventas en este mes.</p>`;
                return ventas.map(v => {
                    const mt = v.pack.metodo === 'mercadopago' ? 'Mercado Pago' : v.pack.metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
                    return `<div class="flex justify-between items-center p-3 rounded-xl mb-2" style="background:${CONFIG.colores.surface};border:1px solid ${CONFIG.colores.secondary}22">
                        <div>
                            <p class="font-semibold text-sm">${v.alumna} — ${v.pack.nombre}</p>
                            <p class="text-xs opacity-60">${v.pack.tipo === 'pack_4' ? 'Pack 4 clases' : 'Clase suelta'} · ${mt} ${v.pack.confirmado ? '· ✓ Confirmado' : '· Pendiente'}</p>
                        </div>
                        <p class="font-bold text-sm">$${v.pack.precio.toLocaleString('es-AR')}</p>
                    </div>`;
                }).join('');
            })()}
        </div>

    </div>`;
};