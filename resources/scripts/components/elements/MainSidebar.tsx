import styled from 'styled-components';

const MainSidebar = styled.nav`
    width: 280px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow-x: hidden;
    padding: 24px 16px;
    user-select: none;
    background: #0a0b0d; /* Noir profond cohérent avec le login */
    border-right: 1px solid rgba(255, 255, 255, 0.08);

    .sidebar-category {
        margin: 12px 8px 4px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.35);
        user-select: none;
    }

    .sidebar-category-admin {
        color: rgba(255, 107, 107, 0.8);
    }

    .admin-link svg {
        fill: rgba(255, 107, 107, 0.75) !important;
    }

    .admin-link:hover {
        background: rgba(255, 107, 107, 0.12) !important;
        color: #ff6b6b !important;
    }

    .admin-link:hover svg {
        fill: #ff6b6b !important;
    }

    .admin-link.active {
        background: rgba(255, 107, 107, 0.18) !important;
        border: 1px solid rgba(255, 107, 107, 0.4) !important;
        box-shadow: 0 0 12px rgba(255, 107, 107, 0.25);
    }

    .admin-link.active::before {
        background: #ff6b6b !important;
        box-shadow: 0 0 10px #ff6b6b;
    }

    & > .hh-subnav-routes-wrapper {
        display: flex;
        flex-direction: column;
        font-size: 14px;
        gap: 4px;

        & > a,
        & > div {
            display: flex;
            position: relative;
            padding: 10px 16px;
            gap: 12px;
            font-weight: 600;
            min-height: 44px;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            color: rgba(255, 255, 255, 0.5);
            align-items: center;
            border-radius: 10px;
            border: 1px solid transparent;

            svg {
                transition:
                    transform 0.2s ease,
                    fill 0.2s ease;
                fill: rgba(255, 255, 255, 0.5);
                width: 20px;
                height: 20px;
            }

            &:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.05);

                svg {
                    fill: #ffffff;
                    transform: translateX(2px);
                }
            }

            &.active {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

                svg {
                    fill: var(--brand, #3372e3);
                }

                &::before {
                    content: '';
                    position: absolute;
                    left: 0px;
                    height: 18px;
                    width: 3px;
                    background: var(--brand, #3372e3);
                    border-radius: 0 4px 4px 0;
                    box-shadow: 0 0 10px var(--brand, #3372e3);
                }
            }
        }
    }

    & > .sidebar-user {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .sidebar-user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        color: white;
    }

    .sidebar-user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        overflow: hidden;
    }

    .sidebar-user-name {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sidebar-user-email {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sidebar-user-logout {
        margin-left: auto;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .sidebar-user-logout:hover {
        background: rgba(255, 0, 0, 0.12);
        color: #ff6b6b;
        border-color: rgba(255, 107, 107, 0.4);
    }
`;

export default MainSidebar;
