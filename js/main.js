
const turnos = [
  { nombre: "Lunes 18 a 20", cupo: 6 },
  { nombre: "Martes 9 a 11", cupo: 6 },
  { nombre: "Martes 18 a 20", cupo: 6 },
  { nombre: "Miércoles 16 a 18", cupo: 6 },
  { nombre: "Miércoles 18 a 20", cupo: 6 }
];

let reservas = [];


function verificarAcceso() {
  const tieneCuenta = confirm("¿Tenés cuenta creada?");
  const tienePago = confirm("¿Tenés el curso pago?");
  return tieneCuenta && tienePago;
}


function reservarTurno(nombreAlumno, indiceTurno) {
  if (turnos[indiceTurno].cupo > 0) {
    reservas.push(`${nombreAlumno} - ${turnos[indiceTurno].nombre}`);
    turnos[indiceTurno].cupo--;
    alert(` Reserva confirmada: ${nombreAlumno} en ${turnos[indiceTurno].nombre}`);
    return true;
  } else {
    alert(" Ese turno ya no tiene cupo disponible.");
    return false;
  }
}


alert("Bienvenida al turnero de clases de cerámica");

if (verificarAcceso()) {
  let continuar = true;

  while (continuar) {
    let nombre = prompt("Ingresá tu nombre:");

    console.log("Turnos disponibles y cupos:");
    for (let i = 0; i < turnos.length; i++) {
      console.log(`${i + 1}. ${turnos[i].nombre} (Cupo: ${turnos[i].cupo})`);
    }

    let opcion = parseInt(prompt("Elegí un turno ingresando el número correspondiente:")) - 1;

    if (opcion >= 0 && opcion < turnos.length) {
      reservarTurno(nombre, opcion);
    } else {
      alert(" Opción inválida. Intentá de nuevo.");
    }

    continuar = confirm("¿Querés registrar otro turno?");
  }

  alert("Gracias por usar el turnero ");
  console.log(" Lista final de reservas:");
  for (let i = 0; i < reservas.length; i++) {
    console.log(reservas[i]);
  }

} else {
  alert(" Para reservar turno necesitás tener cuenta creada y el curso pago.");
}