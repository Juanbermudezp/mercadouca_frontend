export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'El correo es requerido';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Correo inválido';
  if (!password) errors.password = 'La contraseña es requerida';
  return errors;
};

export const validateRegister = ({ username, email, password, firstName, lastName }) => {
  const errors = {};
  if (!firstName) errors.firstName = 'El nombre es requerido';
  if (!lastName) errors.lastName = 'El apellido es requerido';
  if (!username || username.length < 3) errors.username = 'Mínimo 3 caracteres';
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Correo inválido';
  if (!password || password.length < 8) errors.password = 'Mínimo 8 caracteres';
  return errors;
};
