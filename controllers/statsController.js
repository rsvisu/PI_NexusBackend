import supabase from '../database/supabaseClient.js'

class StatsController {

    static async getStats(req, res) {
        // Total de conversaciones
        const conversationsResult = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
        if (conversationsResult.error) throw conversationsResult.error
        const total_conversations = conversationsResult.count

        // Mensajes del usuario enviados hoy
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayResult = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_type', 'user')
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
        if (todayResult.error) throw todayResult.error
        const messages_today = todayResult.count

        // Documentos activos
        const docsResult = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
        if (docsResult.error) throw docsResult.error
        const active_documents = docsResult.count

        // Feedback negativo pendiente de revisión
        const feedbackResult = await supabase
            .from('feedback')
            .select('*', { count: 'exact', head: true })
            .eq('vote', 'negative')
            .eq('is_reviewed', false)
        if (feedbackResult.error) throw feedbackResult.error
        const pending_feedback = feedbackResult.count

        // Mensajes de usuario de los últimos 7 días (para la gráfica de actividad)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const chartResult = await supabase
            .from('messages')
            .select('created_at')
            .eq('sender_type', 'user')
            .gte('created_at', sevenDaysAgo.toISOString())
        if (chartResult.error) throw chartResult.error

        // Agrupamos los mensajes por día inicializando los 7 días con 0
        const countByDay = {}
        for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            const key = d.toISOString().slice(0, 10)
            countByDay[key] = 0
        }
        for (const msg of chartResult.data) {
            const key = msg.created_at.slice(0, 10)
            if (key in countByDay) {
                countByDay[key]++
            }
        }
        const messages_per_day = Object.entries(countByDay).map(([date, count]) => ({ date, count }))

        return res.json({
            total_conversations,
            messages_today,
            active_documents,
            pending_feedback,
            messages_per_day
        })
    }

}

export default StatsController
