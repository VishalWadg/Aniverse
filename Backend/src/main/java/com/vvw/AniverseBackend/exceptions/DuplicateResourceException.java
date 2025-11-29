package com.vvw.AniverseBackend.exceptions;

public class DuplicateResourceException extends RuntimeException{
    //409
    public DuplicateResourceException(String message){
        super(message);
    }
}
