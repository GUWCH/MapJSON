export const useSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    return params
}