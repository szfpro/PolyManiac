import React, { useLayoutEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const VIEWPORT_PADDING_PX = 12;

const Root = styled.div`
    width: 100%;
    height: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ScaledSlot = styled.div`
    width: ${({ $width }) => ($width != null ? `${$width}px` : 'auto')};
    height: ${({ $height }) => ($height != null ? `${$height}px` : 'auto')};
    overflow: hidden;
    flex-shrink: 0;
`;

const ScaledInner = styled.div`
    transform: scale(${({ $scale }) => $scale});
    transform-origin: top left;
    width: ${({ $contentWidth }) => ($contentWidth != null ? `${$contentWidth}px` : 'auto')};
`;

const ViewportFit = ({ className, children }) => {
    const contentRef = useRef(null);
    const [layout, setLayout] = useState({
        contentWidth: 0,
        contentHeight: 0,
        scale: 1,
    });

    const measure = useCallback(() => {
        const el = contentRef.current;
        if (!el) return;

        const width = el.offsetWidth;
        const height = el.offsetHeight;
        if (!width || !height) return;

        const availW = window.innerWidth - VIEWPORT_PADDING_PX * 2;
        const availH = window.innerHeight - VIEWPORT_PADDING_PX * 2;
        const nextScale = Math.min(availW / width, availH / height, 1);

        setLayout((prev) => {
            if (
                prev.contentWidth === width
                && prev.contentHeight === height
                && prev.scale === nextScale
            ) {
                return prev;
            }
            return {
                contentWidth: width,
                contentHeight: height,
                scale: nextScale,
            };
        });
    }, []);

    useLayoutEffect(() => {
        measure();
        window.addEventListener('resize', measure);

        const el = contentRef.current;
        const observer = el ? new ResizeObserver(() => measure()) : null;
        if (el && observer) observer.observe(el);

        return () => {
            window.removeEventListener('resize', measure);
            observer?.disconnect();
        };
    }, [measure, children]);

    const { contentWidth, contentHeight, scale } = layout;
    const slotWidth = contentWidth ? contentWidth * scale : undefined;
    const slotHeight = contentHeight ? contentHeight * scale : undefined;
    const innerWidth = contentWidth || undefined;

    return (
        <Root className={className}>
            <ScaledSlot $width={slotWidth} $height={slotHeight}>
                <ScaledInner $scale={scale} $contentWidth={innerWidth}>
                    <div ref={contentRef}>{children}</div>
                </ScaledInner>
            </ScaledSlot>
        </Root>
    );
};

ViewportFit.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default ViewportFit;
