import { getUserById } from '../models/userModel.js'

const MODERATOR_ROLES = ['admin', 'ctv', 'collaborator']

// Chuan hoa role ve dang chu thuong va dong nhat alias contributor -> collaborator.
function normalizeRole(rawRole) {
  if (!rawRole) return ''
  const role = String(rawRole).trim().toLowerCase()
  if (role === 'contributor') return 'collaborator'
  return role
}

// Uu tien lay role tu token, neu khong co thi thu header x-user-role.
function resolveRole(req) {
  return normalizeRole(req.user?.role || req.headers['x-user-role'])
}

// Middleware kiem tra quyen moderator de duyet nhac.
export async function requireModeratorRole(req, res, next) {
  let role = resolveRole(req)

  // Neu token chi co id (khong co role), lay role tu DB de xac thuc quyen duyet nhac.
  if (!role && req.user?.id) {
    const user = await getUserById(req.user.id)
    role = normalizeRole(user?.role)
  }

  if (!MODERATOR_ROLES.includes(role)) {
    return res.status(403).json({ message: 'Chi admin/ctv moi co quyen duyet nhac' })
  }

  req.moderatorRole = role
  return next()
}
