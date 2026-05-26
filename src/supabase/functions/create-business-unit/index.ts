import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      name,
      category,
      commission,
      phone,
      whatsapp,
      email,
      website,
      cityArea,
      address,
      description,
      manager
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // generate temporary password
    const tempPassword =
      crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // create auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true
      });

    if (authError) {
      throw authError;
    }

    const managerId = authUser.user.id;

    // insert into public.users
    const { error: userInsertError } = await supabase
      .from("users")
      .insert({
        id: managerId,
        full_name: manager,
        email,
        phone,
        role: "manager"
      });

    if (userInsertError) {
      throw userInsertError;
    }

    // create business unit
    const { data: businessUnitId, error: rpcError } =
      await supabase.rpc("create_business_unit", {
        p_business_name: name,
        p_category: category,
        p_commission: commission,
        p_primary_phone: phone,
        p_whatsapp_number: whatsapp,
        p_email: email,
        p_website: website,
        p_location: cityArea,
        p_address: address,
        p_description: description,
        p_manager_id: managerId
      });

    if (rpcError) {
      throw rpcError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        business_unit_id: businessUnitId,
        manager_id: managerId,
        manager_email: email,
        temporary_password: tempPassword
      }),
      {
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});