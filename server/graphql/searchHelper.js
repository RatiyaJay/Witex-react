const { esClient, ensureIndex } = require('../utils/search');

const INDEX = 'users';

async function indexUser(user) {
  try {
    await ensureIndex(INDEX);
    await esClient.index({
      index: INDEX,
      id: String(user.id),
      document: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        contactNo: user.contactNo || '',
        organization: user.organization || '',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      refresh: 'true',
    }, { requestTimeout: 1000 });
  } catch (e) {
    // silent fail to avoid blocking mutations
  }
}

async function removeUser(id) {
  try {
    await esClient.delete({ index: INDEX, id: String(id) }, { requestTimeout: 1000 });
  } catch (_) {}
}

async function searchUsers(term, page, limit) {
  await ensureIndex(INDEX);
  const res = await esClient.search({
    index: INDEX,
    from: Math.max(0, (Math.max(page, 1) - 1) * limit),
    size: limit,
    query: {
      multi_match: {
        query: term,
        fields: [ 'name^2', 'email^3', 'organization', 'contactNo' ],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    }
  }, { requestTimeout: 1000 });
  const hits = res?.hits?.hits || [];
  return { esSearchIds: hits.map(h => Number(h._id)), esTotal: Number(res?.hits?.total?.value || hits.length) };
}

module.exports = { indexUser, removeUser, searchUsers };
