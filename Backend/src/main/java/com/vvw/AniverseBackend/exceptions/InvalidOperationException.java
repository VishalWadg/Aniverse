package com.vvw.AniverseBackend.exceptions;

public class InvalidOperationException extends RuntimeException{
    //400
    public InvalidOperationException(String message){
        super(message);
    }
}
