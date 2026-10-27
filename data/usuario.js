(function () {
  var ahora = new Date();
  var enMinutos = function (valor) {
    return new Date(ahora.getTime() + valor * 60000).toISOString();
  };

  window.usuarioMockData = {
    usuarios: [
      { idUsuario: 1, nombreUsuario: "Ana Ruiz", correo: "ana@correo.com", rol: "admin", registradoEn: "2026-09-01T08:10:00", activo: true },
      { idUsuario: 2, nombreUsuario: "Luis Perez", correo: "luis@correo.com", rol: "user", registradoEn: "2026-09-03T09:00:00", activo: true },
      { idUsuario: 3, nombreUsuario: "Sara Leon", correo: "sara@correo.com", rol: "user", registradoEn: "2026-09-05T10:30:00", activo: true },
      { idUsuario: 4, nombreUsuario: "David Cano", correo: "david@correo.com", rol: "admin", registradoEn: "2026-09-06T11:10:00", activo: true },
      { idUsuario: 5, nombreUsuario: "Paola Rios", correo: "paola@correo.com", rol: "user", registradoEn: "2026-09-07T11:40:00", activo: true },
      { idUsuario: 6, nombreUsuario: "Mario Suarez", correo: "mario@correo.com", rol: "user", registradoEn: "2026-09-08T14:20:00", activo: true },
      { idUsuario: 7, nombreUsuario: "Laura Gomez", correo: "laura@correo.com", rol: "user", registradoEn: "2026-09-10T15:00:00", activo: true },
      { idUsuario: 8, nombreUsuario: "Nicolas Vera", correo: "nicolas@correo.com", rol: "user", registradoEn: "2026-09-12T16:35:00", activo: true },
      { idUsuario: 9, nombreUsuario: "Camila Duarte", correo: "camila@correo.com", rol: "user", registradoEn: "2026-09-13T17:10:00", activo: true },
      { idUsuario: 10, nombreUsuario: "Julian Murillo", correo: "julian@correo.com", rol: "admin", registradoEn: "2026-09-14T18:05:00", activo: true }
    ],
    sesionesActivas: [
      { idSesion: 1, idUsuario: 3, token: "jwt-sesion-3", inicioSesion: enMinutos(-95), ultimoAcceso: enMinutos(-4), estado: "activa" },
      { idSesion: 2, idUsuario: 6, token: "jwt-sesion-6", inicioSesion: enMinutos(-42), ultimoAcceso: enMinutos(-2), estado: "activa" },
      { idSesion: 3, idUsuario: 8, token: "jwt-sesion-8", inicioSesion: enMinutos(-30), ultimoAcceso: enMinutos(-8), estado: "activa" },
      { idSesion: 4, idUsuario: 1, token: "jwt-sesion-1", inicioSesion: enMinutos(-12), ultimoAcceso: enMinutos(-1), estado: "activa" }
    ]
  };
})();
