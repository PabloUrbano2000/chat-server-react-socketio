const { response } = require("express");
const bcrypt = require("bcryptjs");

const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/jwt");

const crearUsuario = async (req, res = response) => {
  try {
    const { email, password, nombre } = req.body || {};

    const existeEmail = await Usuario.findOne({
      email: { $in: email },
    });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya existe",
      });
    }

    const usuario = new Usuario(req.body);

    // encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    // Generar el JWT
    const token = await generarJWT(usuario._id);

    return res.json({
      ok: true,
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el admin",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const usuarioDB = await Usuario.findOne({
      email: { $in: email },
    });
    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "Email no encontrado",
      });
    }

    // Validar el password
    const validPassword = bcrypt.compareSync(password, usuarioDB.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Password no es correcto",
      });
    }

    // Generar el JWT
    const token = await generarJWT(usuarioDB._id);

    return res.json({
      ok: true,
      usuario: usuarioDB,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el admin",
    });
  }
};

const renewToken = async (req, res) => {
  const uid = req.uid;

  // Generar un nuevo JWT
  const token = await generarJWT(uid);

  // Obtener el usuario por uid
  const usuario = await Usuario.findById(uid);

  res.json({
    ok: true,
    token,
    usuario,
  });
};

module.exports = {
  crearUsuario,
  login,
  renewToken,
};
