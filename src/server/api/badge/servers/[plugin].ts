import {shieldResponse} from '~/server/utils/shields'
import {getPluginServers} from '~/server/utils/bstats'
import {formatMetric} from '~/server/utils/formatter'

export default defineEventHandler(async (event) => {
    const plugins: Record<string, any> = useRuntimeConfig(event).plugins

    const plugin = getRouterParam(event, 'plugin')
    if (plugin === undefined || !(plugin in plugins)) {
        return shieldResponse('servers', 'invalid', 'red', true)
    }

    let servers = 0

    const requests: Promise<number>[] = []
    for (const bStatsID of plugins[plugin].bStats) {
        requests.push(getPluginServers(bStatsID).then(result => servers += result))
    }
    await Promise.allSettled(requests)

    return shieldResponse('servers', formatMetric(servers), 'blue')
})
