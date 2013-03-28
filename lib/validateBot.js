module.exports = function(data){
  var errors = Object.keys(data).map(function(f){
    switch(f){
      case 'match' :
        if(!data[f].length) return f + ' cannot be empty.'
        try {
          new RegExp(data[f])
        } catch(e){
          return f + ' is not a valid regular expression. ('+e.message+')'
        }
        break;
      case 'in_reply_to' :
        return false
        break;
      case 'replies' :
        return data[f].
        break;
      default :
        if(!data[f].length) return f + ' cannot be empty.'
        break;
    }
    return false
  }).filter(function(f){ return f })
  return errors
}