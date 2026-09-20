const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "You do not have permission to perform this action",
    });
  }

  next();
};

const requireFacultyOrAdmin = requireRoles("faculty", "admin");

module.exports = requireFacultyOrAdmin;
module.exports.requireRoles = requireRoles;
