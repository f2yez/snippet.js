// Add the snippet here with account id (i.e. config.chameleonAccountId)
// Assuming you preload your page with a current user

(function() {
  if(currentUser.id) {
    chmln.identify({
      uid: currentUser.id,
      created: currentUser.createdAt,
      email: currentUser.email,
      plan: currentUser.planName,
      spend: currentUser.planCost
    });
  }
})();
