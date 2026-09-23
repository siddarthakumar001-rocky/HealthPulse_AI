/**
 * HealthPulse AI - Role-Based Access Control (RBAC) & Object-Level Authorization
 * Protects routes and ensures users only access resources they are entitled to view/edit.
 */

/**
 * Middleware to restrict access to specific roles
 * @param  {...string} allowedRoles (e.g. 'admin', 'phc_staff', 'dho', 'system_admin', 'user')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const userRole = req.user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
        }
      });
    }

    next();
  };
};

/**
 * Guard to verify resource ownership (Anti-IDOR / Anti-BOLA)
 * Verifies that the requester owns the resource (req.user.id === targetUserId)
 * or is an authorized admin/doctor.
 */
const requireSelfOrAdmin = (req, targetUserId) => {
  if (!req.user) return false;
  if (req.user.role === 'admin' || req.user.role === 'system_admin') return true;
  return req.user.id && targetUserId && req.user.id.toString() === targetUserId.toString();
};

module.exports = {
  authorizeRoles,
  requireSelfOrAdmin
};
