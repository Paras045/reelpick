import "./SkeletonCard.css";

export default function SkeletonCard() {
    return (
        <div className="sk-card">
            <div className="sk-card__poster skeleton-base" />
            <div className="sk-card__body">
                <div className="skeleton-base sk-card__line sk-card__line--title" />
                <div className="skeleton-base sk-card__line sk-card__line--sub" />
            </div>
        </div>
    );
}
