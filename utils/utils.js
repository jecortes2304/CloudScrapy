function utils(){

    function verifyUndefined(param){
        return param === undefined  ?  null : param
    }

    return{
        verifyUndefined
    }
}

module.exports = utils()
