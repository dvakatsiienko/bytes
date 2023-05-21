/* Instruments */
import styles from './index-page.module.scss';

export default () => {
    return (
        <main className = { styles.profile }>
            <h1>Profile</h1>
            <section>
                <div>
                    <span className = 'key'>name</span>
                    <span className = 'value'>Dima Vakatsiienko</span>
                </div>

                <div>
                    <span className = 'key'>email</span>
                    <span className = 'value'>imagnum.satellite@gmail.com</span>
                </div>

                <div>
                    <span className = 'key'>location</span>
                    <span className = 'value'>Ukraine, Kyiv</span>
                </div>

                <div>
                    <span className = 'key'>links</span>
                    <span className = 'value'>
                        <a
                            href = 'https://telegra.ph/SeniorLead-Frontend-Developer-10-02'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Cover Letter
                        </a>
                        <a
                            href = 'https://github.com/dvakatsiienko'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Github
                        </a>
                        <a
                            href = 'https://www.linkedin.com/in/dima-vakatsiienko-a20271100/'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Linkedin
                        </a>
                        <a
                            href = 'https://t.me/shining1488'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Telegram
                        </a>
                    </span>
                </div>
            </section>
        </main>
    );
};
