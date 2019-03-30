const library = {
  getEnrichedUser: (currentUser) => {
    if (currentUser) {
      currentUser.user_name = currentUser['email'].split('@')[0]
    }
    return currentUser
  }
}


export default library