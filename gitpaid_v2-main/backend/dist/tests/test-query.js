// backend/tests/test-query.ts
import { LookupResolver } from '@bsv/sdk';
async function queryBounties() {
    try {
        const lookupResolver = new LookupResolver({ networkPreset: 'local' });
        // Query all bounties
        const response = await lookupResolver.query({
            service: 'ls_bounty',
            query: 'findAllBounties'
        });
        if (response.type !== 'freeform') {
            throw new Error('Unexpected response type');
        }
        console.log('All bounties:', JSON.stringify(response.result, null, 2));
        // Query bounties for a specific repository
        const repoResponse = await lookupResolver.query({
            service: 'ls_bounty',
            query: {
                type: 'findByRepo',
                value: {
                    repoOwner: 'bitcoin-sv',
                    repoName: 'bsv-overlay'
                }
            }
        });
        if (repoResponse.type !== 'freeform') {
            throw new Error('Unexpected response type');
        }
        console.log('Repository bounties:', JSON.stringify(repoResponse.result, null, 2));
        return response.result;
    }
    catch (error) {
        console.error('Error querying bounties:', error);
        throw error;
    }
}
queryBounties()
    .then(result => console.log(`Query complete! Found ${result.length} bounties`))
    .catch(err => console.error('Query failed:', err));
//# sourceMappingURL=test-query.js.map