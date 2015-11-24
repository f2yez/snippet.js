// Add the snippet here with account id (i.e. config.chameleonAccountId)
// Assuming you call `currentUserLoaded` after fetching the user

(function() {
  var currentUserLoaded = function(currentUser) {
    chmln.identify({
      uid: currentUser.id,
      created: currentUser.createdAt,
      email: currentUser.email,
      plan: currentUser.planName,
      spend: currentUser.planCost
    });
  };

  var xhr = $.get('/user.json');
  xhr.done(function(data) {
    // Setup other aspects of the environment

    currentUserLoaded(data.user);
  });
})();
