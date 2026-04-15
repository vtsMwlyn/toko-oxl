export default function formatDate(dateInput) {
    const date = new Date(dateInput);

    const day = date.getDate();
    const year = date.getFullYear();

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const month = months[date.getMonth()];

    return `${day} ${month} ${year}`;
}
