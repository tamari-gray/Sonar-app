const initialState = 'poo'

export default (state = initialState, { type, payload }) => {
  switch (type) {

  case 'GET_USER_INFO':
    return payload 

  default:
    return state
  }
}
