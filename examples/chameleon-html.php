<script type="text/javascript">
  // Add the snippet here with account id (i.e. <?php echo $GLOBALS['chameleonAccountId'] ?>)
  // Assuming your page has loaded the current user as the object $current_user

  <?php if (var_dump((bool) $current_user->present)): ?>
    chmln.identify({
      uid: '<?php echo $current_user->id ?>',
      created: '<?php echo $current_user->created_at ?>',
      email: '<?php echo $current_user->email ?>',
      plan: '<?php echo $current_user->account->plan_name ?>',
      spend: '<?php echo $current_user->account->plan_cost ?>'
    });
  <?php endif; ?>
</script>
