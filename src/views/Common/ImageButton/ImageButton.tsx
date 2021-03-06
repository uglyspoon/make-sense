import * as React from 'react';
import {ISize} from "../../../interfaces/ISize";
import './ImageButton.scss';
import classNames from "classnames";

interface Props {
    size:ISize,
    padding?:number;
    image:string,
    imageAlt:string,
    href?:string
    onClick?:() => any;
    style?:React.CSSProperties
    isActive?:boolean;
    isDisabled?:boolean;
    externalClassName?:string;
}

export const ImageButton = (props:Props) => {
    const {size, padding, image, imageAlt, href, onClick, style, isActive, isDisabled, externalClassName} = props;
    const imagePadding:number = !!padding ? padding : 10;

    const onClickHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        !!onClick && onClick();
    };

    const buttonStyle:React.CSSProperties = {
        ...style,
        width: size.width,
        height: size.height
    };

    const imageStyle:React.CSSProperties = {
        maxWidth: size.width - imagePadding,
        maxHeight: size.height - imagePadding
    };

    const getClassName = () => {
        return classNames(
            "ImageButton",
            externalClassName,
            {
                "active": isActive,
                "disabled": isDisabled,
            }
        );
    };
    
    return(
        <div className={getClassName()} style={buttonStyle} onClick={onClickHandler}>
            {!!href && <a href={href} style={imageStyle} target="_blank" rel="noopener noreferrer">
                <img
                    draggable={false}
                    alt={imageAlt}
                    src={image}
                    style={imageStyle}
                />
            </a>}
            {!href && <img
                draggable={false}
                alt={imageAlt}
                src={image}
                style={imageStyle}
            />}
        </div>
    );
};