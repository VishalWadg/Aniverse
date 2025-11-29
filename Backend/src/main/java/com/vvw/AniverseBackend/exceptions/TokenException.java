package com.vvw.AniverseBackend.exceptions;

public class TokenException extends RuntimeException{
    //401
    public TokenException(String message){
        super(message);
    }
}
