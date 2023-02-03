const {
  usuarioConectado,
  usuarioDesconectado,
  getUsuarios,
  grabarMensaje,
} = require("../controllers/socketsController");
const { comprobarJWT } = require("../helpers/jwt");

class Sockets {
  constructor(io) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    this.io.on("connection", async (socket) => {
      // Validar JWT
      // Si el token no es válido (desconectar)
      const [valido, uid] = comprobarJWT(socket.handshake.query["x-token"]);
      if (!valido) {
        console.log("socket no identificado", uid);
        return socket.disconnect();
      }
      await usuarioConectado(uid);

      // Unir al usuarui a una sala de socket.io
      socket.join(uid);

      // Saber que usuario está activo mendiante uid

      // Emitir todos los usuarios conectados
      this.io.emit("lista-usuarios", await getUsuarios());

      // Socket join, uid

      // Escuchar cuando un cliente manda un mensaje
      // mensaje-personal
      socket.on("mensaje-personal", async (payload) => {
        const mensaje = await grabarMensaje(payload);
        // para enviar mensajes personales
        this.io.to(payload.para).emit("mensaje-personal", mensaje);
        this.io.to(payload.de).emit("mensaje-personal", mensaje);
      });

      // Disconnect
      // Marcar en la BD que el usuario se desconectó

      // Emitir todos los usuarios contectados
      socket.on("disconnect", async () => {
        await usuarioDesconectado(uid);
        this.io.emit("lista-usuarios", await getUsuarios());
      });
    });
  }
}

module.exports = Sockets;
