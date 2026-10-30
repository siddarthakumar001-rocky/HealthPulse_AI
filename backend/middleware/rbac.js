/**
 * HealthPulse AI - Role-Based Access Control (RBAC) & Object-Level Authorization
 * Protects routes and ensures users only access resources they are entitled to view/edit.
 */

const CareRelationship = require('../models/CareRelationship');
const ConsentRecord = require('../models/ConsentRecord');

/**
 * Middleware to restrict access to specific roles
 * @param  {...string} allowedRoles (e.g. 'admin', 'phc_staff', 'dho', 'system_admin', 'user', 'patient', 'doctor', 'caregiver', 'clinic_admin')
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
 * or is an authorized admin/system_admin.
 */
const requireSelfOrAdmin = (req, targetUserId) => {
  if (!req.user) return false;
  if (req.user.role === 'admin' || req.user.role === 'system_admin') return true;
  return Boolean(req.user.id && targetUserId && req.user.id.toString() === targetUserId.toString());
};

/**
 * Relationship-based authorization guard:
 * Allows access if:
 * 1. Requester is the patient themself.
 * 2. Requester has an active CareRelationship with patient covering requiredScope.
 * 3. Requester is a system administrator.
 */
const verifyPatientAccess = async (reqUser, targetPatientId, requiredScope = 'vitals_read') => {
  if (!reqUser || !targetPatientId) return false;
  
  // 1. Patient self-access
  if (reqUser.id.toString() === targetPatientId.toString()) {
    return true;
  }

  // 2. System Administrator access
  if (reqUser.role === 'admin' || reqUser.role === 'system_admin') {
    return true;
  }

  // 3. Caregiver or Doctor relationship check
  try {
    const relationship = await CareRelationship.findOne({
      patientId: targetPatientId,
      partnerId: reqUser.id,
      status: 'active',
      scopes: requiredScope
    });

    if (!relationship) return false;

    // Check expiration if set
    if (relationship.expiresAt && new Date(relationship.expiresAt) < new Date()) {
      return false;
    }

    // Check explicit active consent record
    const consent = await ConsentRecord.findOne({
      patientId: targetPatientId,
      granteeId: reqUser.id,
      status: 'active'
    });

    return Boolean(consent);
  } catch (err) {
    return false;
  }
};

module.exports = {
  authorizeRoles,
  requireSelfOrAdmin,
  verifyPatientAccess
};
