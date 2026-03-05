import { type ReactNode } from 'react';
import { useAuthStore } from '../store';
import { Tooltip } from '@mui/material';

type Role = 'patron' | 'vendeur';

interface Props {
    role: Role;
    children: ReactNode;
    /** Si true, masque totalement l'élément. Si false (défaut), il est affiché mais désactivé */
    hideCompletely?: boolean;
    /** Message affiché dans le tooltip quand le rôle est insuffisant */
    tooltip?: string;
}

/**
 * Wrapper conditionnel basé sur le rôle de l'utilisateur connecté.
 * Usage:
 *   <ProtectedByRole role="patron">
 *     <Button ...>Supprimer</Button>
 *   </ProtectedByRole>
 */
export const ProtectedByRole = ({
    role,
    children,
    hideCompletely = false,
    tooltip = 'Action réservée au patron',
}: Props) => {
    const currentRole = useAuthStore((s) => s.role);

    // Si l'utilisateur est patron, il a accès à tout
    const hasAccess = currentRole === 'patron' || role === 'vendeur';

    if (!hasAccess && hideCompletely) {
        return null;
    }

    if (!hasAccess) {
        return (
            <Tooltip title={tooltip} arrow>
                <span style={{ opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
                    {children}
                </span>
            </Tooltip>
        );
    }

    return <>{children}</>;
};
