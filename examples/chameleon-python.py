{% if current_user %}<script>
  // Add the snippet here with account id
  // Assuming your page has loaded the current user as the object current_user
  chmln.identify({
    uid: '{{ current_user.id }}',
    created: '{{ current_user.created_at }}',
    email: '{{ current_user.email }}',
    plan: '{{ current_user.account.plan_name }}',
    spend: '{{ current_user.account.plan_cost }}'
  });
</script>{% endif %}