const { Client } = require('@elastic/elasticsearch');

const ES_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const esClient = new Client({ node: ES_URL });

async function ensureIndex(index) {
  try {
    const exists = await esClient.indices.exists({ index, requestTimeout: 1000 });
    if (!exists) {
      await esClient.indices.create({
        index,
        settings: {
          analysis: {
            analyzer: {
              edge_ngram_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'edge_ngram_filter']
              }
            },
            filter: {
              edge_ngram_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'integer' },
            name: { type: 'text', analyzer: 'edge_ngram_analyzer' },
            email: { type: 'text', analyzer: 'edge_ngram_analyzer' },
            contactNo: { type: 'text' },
            organization: { type: 'text', analyzer: 'edge_ngram_analyzer' },
            role: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }, { requestTimeout: 1000 });
    }
  } catch (_) {}
}

module.exports = { esClient, ensureIndex };
