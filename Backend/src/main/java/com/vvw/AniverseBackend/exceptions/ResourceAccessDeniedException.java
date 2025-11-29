package com.vvw.AniverseBackend.exceptions;

public class ResourceAccessDeniedException extends RuntimeException{
    //403
    public ResourceAccessDeniedException(String message){
        super(message);
    }
}
