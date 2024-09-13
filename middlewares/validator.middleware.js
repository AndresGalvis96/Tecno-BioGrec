import {validationResult} from "express-validator";

export const validate = (validations) => async (res, res, next) => { 
    
    await Promise.all( 
        validations.map(val=> val.run(req))
    );

    const error = validationResult(req);
    if(error.isEmpty()){ 
        return next();
    } 
    res.status(422).json({ 
        error: error.array()
    })
} 