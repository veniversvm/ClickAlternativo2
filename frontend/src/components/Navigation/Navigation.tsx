import  MenuButton  from '../Button/MenuButton';
import { navLinks } from '../../data/navigation';
import './Navigation.scss'


export const Navigation = () => {

    <aside id="sidebar-menu" class="sidebar">
    <div class="sidebar-header">
        <button id="close-menu-btn" class="close-button" aria-label="Cerrar menú">
            ×
        </button>
    </div>

    <nav class="sidebar-nav">
        <ul>
            {navLinks.map(link => (
                <li>
                    <MenuButton href={link.href}>{link.text}</MenuButton>
                </li>
            ))}
        </ul>
    </nav>

    <footer class="sidebar-footer">
        <a href="#" aria-label="Instagram">
            IG
        </a>
        <a href="#" aria-label="YouTube">
            YT
        </a>
        <span>@Click_Alternativo</span>
    </footer>
</aside>
    
}