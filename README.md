const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          status,
          created_at,
          payment_status,
          credit_status,
          source_user_id,
          business_unit_services (
            service_name
          ),
          users!source_user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load leads:', error);
        return;
      }

      const mappedLeads = (data || []).map((lead) => ({
        id: lead.id,
        customer_name: lead.customer_name,
        status: lead.status || 'Pending',
        service: lead.business_unit_services?.service_name || 'Unknown',
        date: lead.created_at,
        agentId: lead.users?.full_name || 'Unknown',
        paymentStatus: lead.payment_status,
        creditStatus: lead.credit_status === 'credited' ? 'Credited' : 'Pending'
      }));

      const summary = {
        total: mappedLeads.length,
        pending: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'pending'
        ).length,
        in_progress: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'in progress'
        ).length,
        completed: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'completed'
        ).length
      };

      const visibleLeads =
        statusFilter === 'All'
          ? mappedLeads
          : mappedLeads.filter(
              (lead) => lead.status?.toLowerCase() === statusFilter.toLowerCase()
            );

      setLeads(visibleLeads);
      setSummary(summary);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };